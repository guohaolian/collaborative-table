import { WebSocketServer } from 'ws'
import fs from 'node:fs'
import path from 'node:path'

const PORT = Number.parseInt(process.env.PORT || '1234', 10)
const HOST = process.env.HOST || '0.0.0.0'
const STATE_FILE = process.env.STATE_FILE
  ? path.resolve(process.env.STATE_FILE)
  : null

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function now() {
  return Date.now()
}

function loadState() {
  if (!STATE_FILE) return null
  try {
    if (!fs.existsSync(STATE_FILE)) return null
    const raw = fs.readFileSync(STATE_FILE, 'utf8')
    const parsed = safeJsonParse(raw)
    if (!parsed || !parsed.columns || !parsed.tableData) return null
    return parsed
  } catch {
    return null
  }
}

function saveState(state) {
  if (!STATE_FILE) return
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
  } catch {
    // ignore
  }
}

function defaultState() {
  return {
    version: 0,
    columns: [
      { id: 'col_1', name: '姓名', width: 180, createdAt: 0 },
      { id: 'col_2', name: '部门', width: 180, createdAt: 0 },
      { id: 'col_3', name: '职位', width: 180, createdAt: 0 },
      { id: 'col_4', name: '邮箱', width: 220, createdAt: 0 }
    ],
    tableData: [
      { id: 'row_1', cells: {}, createdAt: 0 },
      { id: 'row_2', cells: {}, createdAt: 0 },
      { id: 'row_3', cells: {}, createdAt: 0 }
    ]
  }
}

function sortByCreatedAtThenId(items) {
  items.sort((a, b) => {
    const ta = typeof a.createdAt === 'number' ? a.createdAt : 0
    const tb = typeof b.createdAt === 'number' ? b.createdAt : 0
    if (ta !== tb) return ta - tb
    const ia = String(a.id || '')
    const ib = String(b.id || '')
    return ia.localeCompare(ib)
  })
}

const state = loadState() || defaultState()

const wss = new WebSocketServer({ port: PORT, host: HOST })

/** @type {Map<import('ws').WebSocket, { instanceId: string, user: any }>} */
const clients = new Map()

function broadcast(message) {
  const payload = JSON.stringify(message)
  for (const ws of clients.keys()) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload)
    }
  }
}

function send(ws, message) {
  if (ws.readyState !== ws.OPEN) return
  ws.send(JSON.stringify(message))
}

function currentUsers() {
  return Array.from(clients.values())
    .map((c) => c.user)
    .filter(Boolean)
}

function bumpVersion() {
  state.version += 1
  saveState(state)
}

function applyOperation(msg) {
  switch (msg.type) {
    case 'cell_update': {
      const { rowIndex, colIndex, value } = msg
      if (!Number.isInteger(rowIndex) || !Number.isInteger(colIndex)) return
      const row = state.tableData[rowIndex]
      const col = state.columns[colIndex]
      if (!row || !col) return
      if (!row.cells) row.cells = {}
      row.cells[col.id] = value
      bumpVersion()
      return
    }
    case 'column_update': {
      const { colIndex, name } = msg
      if (!Number.isInteger(colIndex)) return
      const col = state.columns[colIndex]
      if (!col) return
      col.name = name
      bumpVersion()
      return
    }
    case 'row_add': {
      const { row } = msg
      if (!row || !row.id) return
      if (!state.tableData.find((r) => r.id === row.id)) {
        state.tableData.push({
          id: row.id,
          cells: row.cells || {},
          createdAt: typeof row.createdAt === 'number' ? row.createdAt : now()
        })
        sortByCreatedAtThenId(state.tableData)
        bumpVersion()
      }
      return
    }
    case 'column_add': {
      const { column } = msg
      if (!column || !column.id) return
      if (!state.columns.find((c) => c.id === column.id)) {
        state.columns.push({
          id: column.id,
          name: column.name ?? '新列',
          width: column.width ?? 180,
          createdAt: typeof column.createdAt === 'number' ? column.createdAt : now()
        })
        sortByCreatedAtThenId(state.columns)
        bumpVersion()
      }
      return
    }
    case 'editing_state': {
      // 编辑态不落盘、不改版本，只做中转
      return
    }
    default:
      return
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const text = raw.toString('utf8')
    const msg = safeJsonParse(text)
    if (!msg || typeof msg.type !== 'string') return

    if (msg.type === 'hello') {
      const instanceId = String(msg.fromInstance || msg.instanceId || '')
      const user = msg.user
        ? {
            id: String(msg.user.id || ''),
            name: String(msg.user.name || ''),
            color: String(msg.user.color || ''),
            avatar: msg.user.avatar || '',
            instanceId
          }
        : null

      clients.set(ws, { instanceId, user })

      // 给自己下发在线用户列表 + 当前表格状态
      send(ws, { type: 'user_list', users: currentUsers(), timestamp: now() })
      send(ws, {
        type: 'sync_response',
        data: state,
        timestamp: now()
      })

      // 广播上线
      broadcast({
        type: 'user_online',
        user,
        instanceId,
        timestamp: now()
      })
      broadcast({ type: 'user_list', users: currentUsers(), timestamp: now() })
      return
    }

    if (msg.type === 'sync_request') {
      send(ws, { type: 'sync_response', data: state, timestamp: now() })
      return
    }

    // 其他消息：先更新服务端状态（如果是写操作），再广播给所有客户端
    applyOperation(msg)

    // 附带服务端版本，便于调试/将来扩展
    broadcast({ ...msg, serverVersion: state.version })
  })

  ws.on('close', () => {
    const info = clients.get(ws)
    clients.delete(ws)

    if (info?.instanceId) {
      broadcast({
        type: 'user_offline',
        instanceId: info.instanceId,
        timestamp: now()
      })
      broadcast({ type: 'user_list', users: currentUsers(), timestamp: now() })
    }
  })
})

console.log(`[WS] 协作服务已启动: ws://${HOST}:${PORT}`)
if (STATE_FILE) console.log(`[WS] 状态持久化文件: ${STATE_FILE}`)
