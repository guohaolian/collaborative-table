<template>
  <div class="table-wrapper">
    <table class="collaborative-table">
      <thead>
        <tr>
          <th class="row-number">#</th>
          <th v-for="(col, colIndex) in columns" :key="col.id" class="column-header">
            <input 
              v-model="col.name"
              @input="$emit('column-update', colIndex)"
              @focus="$emit('cell-focus', -1, colIndex)"
              class="header-input"
              :placeholder="'列 ' + (colIndex + 1)"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="row.id">
          <td class="row-number">{{ rowIndex + 1 }}</td>
          <td v-for="(col, colIndex) in columns" :key="col.id" class="table-cell" :class="getCellClass(rowIndex, colIndex)">
            <div class="cell-wrapper">
              <input 
                :value="getCellValue(rowIndex, colIndex)"
                @input="$emit('cell-input', rowIndex, colIndex, $event.target.value)"
                @focus="$emit('cell-focus', rowIndex, colIndex)"
                @blur="$emit('cell-blur', rowIndex, colIndex)"
                class="cell-input"
                :placeholder="col.name || '列' + (colIndex + 1)"
              />
              <div v-if="getEditingUser(rowIndex, colIndex)" class="editing-indicator" :style="{ backgroundColor: getEditingUser(rowIndex, colIndex).userColor }">
                {{ getEditingUser(rowIndex, colIndex).userName }} 正在编辑
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: Array,
  tableData: Array,
  getCellValue: Function,
  getEditingUser: Function,
  getCellClass: Function
})
defineEmits(['cell-input', 'cell-focus', 'cell-blur', 'column-update'])
</script>

<style scoped>
.table-wrapper {
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-height: 500px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.collaborative-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.collaborative-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.row-number {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  text-align: center;
  padding: 12px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  min-width: 50px;
  position: sticky;
  left: 0;
  z-index: 5;
  font-size: 13px;
}

.column-header {
  padding: 8px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  min-width: 180px;
  background: #f9fafb;
}

.header-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.header-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.table-cell {
  padding: 0;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  background: white;
}

.cell-wrapper {
  position: relative;
}

.cell-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  font-size: 14px;
  transition: all 0.2s;
  background: transparent;
}

.cell-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #f0f9ff;
}

.table-cell.being-edited .cell-input {
  background: #fef3c7;
  border-color: #f59e0b;
}

.table-cell.editing-self .cell-input {
  background: #dbeafe;
  border-color: #3b82f6;
}

.editing-indicator {
  position: absolute;
  top: -22px;
  left: 0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: white;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  animation: slideDown 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
