<template>
  <table>
    <thead>
      <tr>
        <th>日期</th><th>金额</th><th>商户</th><th>描述</th><th>类别</th><th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="b in bills" :key="b.id">
        <td>{{ b.tx_date }}</td>
        <td>{{ Number(b.amount).toFixed(2) }}</td>
        <td>{{ b.merchant }}</td>
        <td class="muted">{{ b.raw_description }}</td>
        <td>
          <CategorySelect
            :modelValue="b.category"
            @change="(v) => $emit('changeCategory', b, v)"
          />
        </td>
        <td>
          <router-link :to="`/bills/${b.id}`">详情</router-link>
          <button @click="$emit('remove', b)">删除</button>
        </td>
      </tr>
      <tr v-if="!bills.length">
        <td colspan="6" class="muted">暂无数据</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import CategorySelect from './CategorySelect.vue'

defineProps({ bills: { type: Array, required: true } })
defineEmits(['changeCategory', 'remove'])
</script>