import { Xendit, Invoice as XenditInvoice } from 'xendit-node'

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || '',
})

const invoiceApi = new XenditInvoice({ secretKey: process.env.XENDIT_SECRET_KEY || '' })

export { xenditClient, invoiceApi }
export type { XenditInvoice }