import { config } from '@keystatic/core'

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'netsorna-admin/netsorna-wb',
  },
  ...
})