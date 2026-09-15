import MockAdapter from 'axios-mock-adapter'
import { client, baseURL } from './client'
import { labelOf } from '../constants/category'

// 与后端一致的简易关键字规则(前端 mock 自带分类能力)
const KEYWORDS = {
  dining: ['星巴克', '麦当劳', '肯德基', '美团外卖', '饿了么'],
  transport: ['滴滴', '出租车', '高铁', '12306', '地铁'],
  shopping: ['淘宝', '京东', '拼多多', '天猫'],
  entertainment: ['影院', '电影院', '腾讯视频', '爱奇艺', 'Steam'],
  housing: ['房租', '水电费', '物业', '自如'],
  medical: ['医院', '药店', '体检', '美团买药'],
  education: ['培训', 'Coursera', '极客时间', '得到']
}

function classify(merchant = '', raw = '') {
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    if (kws.includes(merchant)) return cat
  }
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    if (kws.some(k => raw.includes(k))) return cat
  }
  return 'other'
}

function nowIso() { return new Date().toISOString() }

// 初始化 20 条示例数据
const bills = []
{
  const samples = [
    ['2026-09-01', 35.5,  '星巴克',     'STARBUCKS COFFEE #1'],
    ['2026-09-02', 28.0,  '麦当劳',     'MC DONALD #88'],
    ['2026-09-03', 18.0,  '地铁',       'metro ride'],
    ['2026-09-04', 199.0, '淘宝',       'phone case'],
    ['2026-09-05', 89.0,  '滴滴',       'didi ride'],
    ['2026-09-06', 50.0,  '影院',       'cinema ticket'],
    ['2026-09-07', 2200,   '房租',       'monthly rent'],
    ['2026-09-08', 120.0, '医院',       'checkup fee'],
    ['2026-09-09', 99.0,  '得到',       'course fee'],
    ['2026-09-10', 15.0,  '美团外卖',   'lunch delivery'],
    ['2026-08-25', 49.0,  '京东',       'book purchase'],
    ['2026-08-26', 22.0,  '出租车',     'taxi ride'],
    ['2026-08-27', 120.0, 'Steam',      'game purchase'],
    ['2026-08-28', 88.0,  '自如',       'service fee'],
    ['2026-08-29', 320.0, '爱奇艺',     'membership'],
    ['2026-08-30', 199.0, '12306',      'train ticket'],
    ['2026-08-31', 18.0,  '地铁',       'metro ride'],
    ['2026-09-01', 56.0,  '肯德基',     'KFC lunch'],
    ['2026-09-02', 188.0, '极客时间',   'tech course'],
    ['2026-09-03', 42.0,  '神秘商家',   'misc']
  ]
  let id = 1
  for (const [d, a, m, r] of samples) {
    bills.push({
      id: id++,
      tx_date: d,
      amount: a,
      merchant: m,
      raw_description: r,
      category: classify(m, r),
      source: 'mock',
      created_at: nowIso(),
      updated_at: nowIso()
    })
  }
}

export function setupMock() {
  const mock = new MockAdapter(client, { delayResponse: 0 })

  mock.onGet(/\/bills(\?.*)?$/).reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1] || '')
    let list = [...bills]
    const cat = params.get('category')
    const start = params.get('start_date')
    const end = params.get('end_date')
    const sort = params.get('sort') || 'tx_date'
    const order = (params.get('order') || 'desc').toLowerCase()
    if (cat) list = list.filter(b => b.category === cat)
    if (start) list = list.filter(b => b.tx_date >= start)
    if (end)   list = list.filter(b => b.tx_date <= end)
    list.sort((a, b) => {
      const av = a[sort], bv = b[sort]
      if (av === bv) return 0
      return (av > bv ? 1 : -1) * (order === 'asc' ? 1 : -1)
    })
    return [200, { data: list, total: list.length }]
  })

  mock.onGet(/\/bills\/\d+$/).reply(config => {
    const id = Number(config.url.split('/').pop())
    const found = bills.find(b => b.id === id)
    if (!found) return [404, { error: { code: 'NOT_FOUND', message: 'bill not found' } }]
    return [200, found]
  })

  mock.onPost('/bills').reply(config => {
    const body = JSON.parse(config.data)
    if (!body.tx_date || !body.amount || !body.merchant) {
      return [400, { error: { code: 'INVALID', message: 'missing required fields' } }]
    }
    const b = {
      id: Math.max(...bills.map(x => x.id)) + 1,
      tx_date: body.tx_date,
      amount: body.amount,
      merchant: body.merchant,
      raw_description: body.raw_description || '',
      category: classify(body.merchant, body.raw_description || ''),
      source: 'manual',
      created_at: nowIso(),
      updated_at: nowIso()
    }
    bills.push(b)
    return [201, b]
  })

  mock.onPut(/\/bills\/\d+$/).reply(config => {
    const id = Number(config.url.split('/').pop())
    const body = JSON.parse(config.data)
    const idx = bills.findIndex(b => b.id === id)
    if (idx < 0) return [404, { error: { code: 'NOT_FOUND', message: 'bill not found' } }]
    bills[idx] = { ...bills[idx], ...body, updated_at: nowIso() }
    return [200, bills[idx]]
  })

  mock.onPatch(/\/bills\/\d+\/category$/).reply(config => {
    const id = Number(config.url.split('/').slice(-2, -1)[0])
    const body = JSON.parse(config.data)
    const idx = bills.findIndex(b => b.id === id)
    if (idx < 0) return [404, { error: { code: 'NOT_FOUND', message: 'bill not found' } }]
    bills[idx].category = body.category
    bills[idx].updated_at = nowIso()
    return [200, bills[idx]]
  })

  mock.onDelete(/\/bills\/\d+$/).reply(config => {
    const id = Number(config.url.split('/').pop())
    const idx = bills.findIndex(b => b.id === id)
    if (idx < 0) return [404, { error: { code: 'NOT_FOUND', message: 'bill not found' } }]
    bills.splice(idx, 1)
    return [204]
  })

  mock.onPost('/bills/upload').reply(() => {
    const failed = []
    return [200, { imported_count: 0, failed_count: failed.length, failed_rows: failed }]
  })

  return mock
}

export { bills, classify, labelOf }