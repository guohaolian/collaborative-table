# Ubuntu 部署文档（仅 IP、80 端口已占用、同机部署前端 + 协作服务）

本文档适用于：

- 只有服务器 IP、没有域名
- 服务器上 Nginx 的 80 端口已被其它应用占用
- 本项目的“前端静态站点 + WebSocket 协作服务端”都部署在同一台 Ubuntu 服务器
- 你希望：开机自启、自动重启、便于查看日志

## 目标架构

- 访问入口：`http://<服务器IP>:8055`
- WebSocket：前端同源连接 `ws://<服务器IP>:8055/ws`
- Nginx：监听 `8055`，托管前端静态文件，同时将 `/ws` 反代到本机协作服务端
- 协作服务端（Node）：监听 `127.0.0.1:1234`（不对外开放 1234，更安全）

## 目录约定（按你的实际路径）

- 后端代码目录（项目源码，包含 `server/wsServer.js`）：
  - `/opt/collab_table/backend`
- 前端静态目录（放 `npm run build` 生成的 `dist` 内容）：
  - `/opt/collab_table/www/fronted_table`
- 协作服务端持久化状态文件（可选）：
  - `/var/lib/collab-table/state.json`

> 注意：`fronted_table` 是你当前命名（虽然更常见写法是 `frontend_table`，但这里完全按你约定来）。

---

## 0. 前置检查

### 0.1 确认 Node 已安装

```bash
node -v
npm -v
```

建议 Node 18+。

### 0.2 确认 Nginx 已安装并运行

```bash
nginx -v
sudo systemctl status nginx --no-pager
```

### 0.3 确认 8055 未被占用

```bash
sudo ss -lntp | grep ':8055' || true
```

如果看到已有进程占用 8055，请换一个端口（例如 8090），并同步修改 Nginx 配置与安全组放行端口。

---

## 1. 准备代码目录

把项目代码放到：`/opt/collab_table/backend`

示例：

```bash
sudo mkdir -p /opt/collab_table
sudo chown -R $USER:$USER /opt/collab_table

# 例如你用 git 拉取
cd /opt/collab_table
# git clone <你的仓库地址> backend

# 或者你用 scp/zip 上传后解压到 backend
cd /opt/collab_table/backend
```

确保目录里能看到：

- `package.json`
- `server/wsServer.js`
- `deploy/nginx/frontend_table.config`
- `deploy/systemd/collab-table-ws.service`

---

## 2. 安装依赖并构建前端

在项目根目录执行：

```bash
cd /opt/collab_table/backend
npm install
npm run build
```

构建完成后会生成 `dist/` 目录。

---

## 3. 发布前端静态文件到 /opt/collab_table/www/fronted_table

```bash
sudo mkdir -p /opt/collab_table/www/fronted_table

# 清空旧文件（谨慎确认路径）
sudo rm -rf /opt/collab_table/www/fronted_table/*

# 拷贝本次构建产物
sudo cp -r /opt/collab_table/backend/dist/* /opt/collab_table/www/fronted_table/
```

可选：检查目录里是否存在 `index.html`

```bash
ls -la /opt/collab_table/www/fronted_table | head
```

---

## 4. 配置 Nginx（监听 8055，不占用 80）

本项目已提供 Nginx 配置模板：

- [deploy/nginx/frontend_table.config](deploy/nginx/frontend_table.config)

### 4.1 安装到 sites-available

```bash
sudo cp /opt/collab_table/backend/deploy/nginx/frontend_table.config /etc/nginx/sites-available/fronted_table
```

如果你改了监听端口或 root 路径，请直接编辑：

```bash
sudo nano /etc/nginx/sites-available/fronted_table
```

### 4.2 启用站点

Ubuntu 常见做法是创建软链接到 `sites-enabled`：

```bash
sudo ln -sf /etc/nginx/sites-available/fronted_table /etc/nginx/sites-enabled/fronted_table
```

> 如果你的 Nginx 主配置没有 include `sites-enabled/*`，需要你在 `/etc/nginx/nginx.conf` 或对应主配置中确认包含。

### 4.3 测试并重载

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 验证 Nginx 是否在监听 8055

```bash
sudo ss -lntp | grep ':8055'
```

---

## 5. 配置协作服务端（systemd 开机自启 + 自动重启）

本项目已提供 systemd 模板：

- [deploy/systemd/collab-table-ws.service](deploy/systemd/collab-table-ws.service)
- [deploy/systemd/collab-table-ws.default](deploy/systemd/collab-table-ws.default)

### 5.1 拷贝 unit 文件

```bash
sudo cp /opt/collab_table/backend/deploy/systemd/collab-table-ws.service /etc/systemd/system/collab-table-ws.service
```

模板默认：

- `WorkingDirectory=/opt/collab_table/backend`
- `ExecStart=/usr/bin/env node server/wsServer.js`
- `User=www-data`（和 Nginx 常用用户一致）

如果你想用其它用户运行（例如 `ubuntu`），请自行改 `User/Group`，同时注意状态目录权限。

### 5.2 配置环境变量（HOST/PORT/STATE_FILE）

```bash
sudo cp /opt/collab_table/backend/deploy/systemd/collab-table-ws.default /etc/default/collab-table-ws
sudo nano /etc/default/collab-table-ws
```

推荐保持：

- `HOST=127.0.0.1`
- `PORT=1234`

这样 1234 不对外暴露，只允许 Nginx 反代访问。

### 5.3 创建状态目录并赋权（如果启用 STATE_FILE）

```bash
sudo mkdir -p /var/lib/collab-table
sudo chown -R www-data:www-data /var/lib/collab-table
```

### 5.4 启动 + 开机自启

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now collab-table-ws
```

### 5.5 查看状态与日志

```bash
sudo systemctl status collab-table-ws --no-pager
sudo journalctl -u collab-table-ws -f
```

---

## 6. 安全组/防火墙放行

因为我们让 Nginx 监听 8055 并对外提供服务，所以最少要放行：

- `8055/TCP`

协作服务端 1234 只监听 `127.0.0.1` 时：

- 不需要放行 `1234/TCP`

---

## 7. 访问验证（从你自己的电脑）

### 7.1 验证 HTTP

浏览器打开：

- `http://<服务器IP>:8055`

能看到页面即表示静态站点 OK。

### 7.2 验证 WebSocket

最直观的验证方式：

1. 在两台电脑（或同一台电脑不同浏览器/无痕窗口）同时打开 `http://<服务器IP>:8055`
2. 顶部在线人数应变化
3. 在其中一个页面编辑表格，另一个页面应实时同步

如果在线人数不变化、同步不生效：优先看“排错”章节。

---

## 8. 更新发布（后续迭代怎么发版）

每次更新代码后，重复以下流程即可：

```bash
cd /opt/collab_table/backend

# 拉新代码（如果你用 git）
# git pull

npm install
npm run build

sudo rm -rf /opt/collab_table/www/fronted_table/*
sudo cp -r dist/* /opt/collab_table/www/fronted_table/

# 如果你更新了 wsServer.js 或 server 逻辑，需要重启协作服务
sudo systemctl restart collab-table-ws

# Nginx 配置没变一般无需 reload；变了再 reload
# sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. 常见问题排错

### 9.1 打不开 http://IP:8055

- 检查安全组是否放行 `8055/TCP`
- 检查 Nginx 是否监听：`sudo ss -lntp | grep ':8055'`
- 检查站点是否启用：`ls -la /etc/nginx/sites-enabled/ | grep fronted_table`
- 检查 Nginx 语法：`sudo nginx -t`
- 看 Nginx 日志：

```bash
sudo tail -n 200 /var/log/nginx/error.log
sudo tail -n 200 /var/log/nginx/access.log
```

### 9.2 页面能打开，但协作不同步

- 检查协作服务是否在运行：

```bash
sudo systemctl status collab-table-ws --no-pager
sudo journalctl -u collab-table-ws -n 200 --no-pager
```

- 检查协作服务是否监听在本机：

```bash
sudo ss -lntp | grep ':1234'
```

- 检查 Nginx 是否正确反代 `/ws`：
  - 确认 `/etc/nginx/sites-available/fronted_table` 中 `location /ws` 存在且 `proxy_pass http://127.0.0.1:1234;`
  - 修改后执行：`sudo nginx -t && sudo systemctl reload nginx`

- 浏览器端（F12 -> Console/Network）：
  - 看是否出现 WebSocket 连接失败
  - 如果显示连接到了错误地址，请检查前端是否被正确托管在 8055（以及是否有自定义 `VITE_WS_URL` 覆盖）

### 9.3 systemd 服务不停重启

- 先看日志：

```bash
sudo journalctl -u collab-table-ws -n 200 --no-pager
```

- 常见原因：
  - `WorkingDirectory` 不对（找不到 `server/wsServer.js`）
  - Node 不在 PATH（模板已用 `/usr/bin/env node` + 显式 PATH，通常可解决）
  - `STATE_FILE` 目录无写权限（确保 `/var/lib/collab-table` 属于 `www-data`）

### 9.4 如何确认 WebSocket 端口没有对外开放？

如果你使用了 `HOST=127.0.0.1`：

```bash
sudo ss -lntp | grep ':1234'
```

应该看到监听地址是 `127.0.0.1:1234`，而不是 `0.0.0.0:1234`。

---

## 10. 你可能会想要的增强（可选）

- 访问鉴权（token）：避免公网被陌生人连入协作服务
- 多房间（roomId）：一台服务支持多张表/多个项目隔离

如果你要做这两点，我可以直接在现有协议上加，改动很小。
