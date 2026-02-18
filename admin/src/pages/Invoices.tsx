import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Download, Mail, MessageCircle, FileText, Eye } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

interface Order {
  id: string
  order_number: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: any
  subtotal: number
  shipping_cost: number | null
  total: number
  status: string | null
  payment_status: string | null
  created_at: string | null
  order_items: Array<{
    id: string
    product_title: string
    quantity: number
    unit_price: number
    total_price: number
    size?: string | null
  }>
}

function generateInvoiceHTML(order: Order): string {
  const invoiceNumber = `FAC-${order.order_number.replace('CMD-', '')}`
  const shippingAddr = order.shipping_address as any
  const date = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : ''

  const itemsRows = (order.order_items || []).map(item => `
    <tr>
      <td style="padding:10px 8px; border-bottom:1px solid #eee;">${item.product_title}${item.size ? ` (${item.size})` : ''}</td>
      <td style="padding:10px 8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px; border-bottom:1px solid #eee; text-align:right;">${item.unit_price.toFixed(0)} FCFA</td>
      <td style="padding:10px 8px; border-bottom:1px solid #eee; text-align:right; font-weight:600;">${item.total_price.toFixed(0)} FCFA</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { background: #0a0a0a; padding: 30px; display: flex; justify-content: space-between; align-items: center; }
        .brand { color: #FFD000; font-size: 32px; font-weight: 900; letter-spacing: 3px; }
        .brand-sub { color: #999; font-size: 11px; margin-top: 4px; }
        .invoice-badge { background: #FFD000; color: #0a0a0a; padding: 8px 20px; border-radius: 4px; font-weight: 700; font-size: 14px; }
        .meta { display: flex; justify-content: space-between; margin: 30px 0; }
        .meta-block h3 { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .meta-block p { font-size: 14px; color: #1a1a1a; line-height: 1.6; }
        .divider { height: 2px; background: linear-gradient(to right, #FFD000, #0a0a0a); margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        thead { background: #0a0a0a; color: #FFD000; }
        thead th { padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
        thead th:nth-child(2) { text-align: center; }
        .totals { margin-left: auto; width: 280px; margin-top: 20px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid #eee; }
        .totals-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 700; border-top: 2px solid #FFD000; margin-top: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 11px; }
        .paid-stamp { display: inline-block; border: 3px solid #16a34a; color: #16a34a; padding: 6px 20px; border-radius: 4px; font-weight: 700; font-size: 18px; transform: rotate(-5deg); margin-top: 20px; }
      </style>
    </head>
    <body>
    <div class="invoice">
      <div class="header">
        <div>
          <div class="brand">BARDAHL</div>
          <div class="brand-sub">Lubrifiants & Solutions Automobile</div>
        </div>
        <div class="invoice-badge">FACTURE</div>
      </div>

      <div class="meta">
        <div class="meta-block">
          <h3>Facture N°</h3>
          <p style="font-size:18px; font-weight:700; color:#FFD000;">${invoiceNumber}</p>
          <p style="margin-top:4px;">Commande : ${order.order_number}</p>
          <p>Date : ${date}</p>
        </div>
        <div class="meta-block" style="text-align:right;">
          <h3>Client</h3>
          <p><strong>${order.customer_name || 'N/A'}</strong></p>
          ${order.customer_phone ? `<p>${order.customer_phone}</p>` : ''}
          ${order.customer_email ? `<p>${order.customer_email}</p>` : ''}
          ${shippingAddr?.city ? `<p>${shippingAddr.city}, ${shippingAddr.country || ''}</p>` : ''}
        </div>
      </div>

      <div class="divider"></div>

      <table>
        <thead>
          <tr>
            <th>Désignation</th>
            <th style="text-align:center;">Qté</th>
            <th style="text-align:right;">Prix unitaire</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Sous-total</span><span>${(order.subtotal || 0).toFixed(0)} FCFA</span></div>
        <div class="totals-row"><span>Livraison</span><span>${(order.shipping_cost || 0).toFixed(0)} FCFA</span></div>
        <div class="totals-total"><span>TOTAL</span><span>${(order.total || 0).toFixed(0)} FCFA</span></div>
      </div>

      ${order.payment_status === 'paid' ? '<div style="text-align:right; margin-top:20px;"><div class="paid-stamp">PAYÉ</div></div>' : ''}

      <div class="footer">
        <p>BARDAHL - Lubrifiants & Solutions Automobile</p>
        <p style="margin-top:4px;">Merci pour votre confiance. Pour toute question, contactez-nous.</p>
        <p style="margin-top:8px; color:#ccc;">Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    </div>
    </body>
    </html>
  `
}

async function printInvoicePDF(order: Order) {
  const html = generateInvoiceHTML(order)
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    toast.error('Veuillez autoriser les popups pour générer le PDF')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

export default function Invoices() {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data || []) as Order[]
    },
  })

  const handleDownload = async (order: Order) => {
    await printInvoicePDF(order)
    toast.success(`Facture ${order.order_number} ouverte pour impression/sauvegarde`)
  }

  const handleSendEmail = async (order: Order) => {
    if (!order.customer_email) {
      toast.error('Ce client n\'a pas d\'email enregistré')
      return
    }
    setSendingEmail(order.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Non authentifié')

      const invoiceNumber = `FAC-${order.order_number.replace('CMD-', '')}`
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: order.customer_email,
          subject: `Votre facture ${invoiceNumber} - Bardahl`,
          template: 'order_confirmation',
          data: {
            customerName: order.customer_name,
            orderNumber: order.order_number,
            total: order.total,
          },
        },
      })
      if (error) throw error
      toast.success(`Facture envoyée à ${order.customer_email}`)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setSendingEmail(null)
    }
  }

  const handleWhatsApp = (order: Order) => {
    const phone = order.customer_phone?.replace(/\D/g, '') || ''
    const invoiceNumber = `FAC-${order.order_number.replace('CMD-', '')}`
    const message = encodeURIComponent(
      `Bonjour ${order.customer_name || ''},\n\nVoici votre facture Bardahl :\n` +
      `📋 Facture N° : ${invoiceNumber}\n` +
      `🛒 Commande : ${order.order_number}\n` +
      `💰 Total : ${(order.total || 0).toFixed(0)} FCFA\n\n` +
      `Merci pour votre confiance !\nL'équipe Bardahl`
    )
    const url = phone
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`
    window.open(url, '_blank')
  }

  const getStatusBadge = (status: string | null) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive'> = {
      paid: 'default', confirmed: 'default',
      pending: 'secondary', failed: 'destructive', cancelled: 'destructive',
    }
    const labels: Record<string, string> = {
      paid: 'Payé', confirmed: 'Confirmé', pending: 'En attente',
      failed: 'Échoué', cancelled: 'Annulé', shipped: 'Expédié', delivered: 'Livré',
    }
    return (
      <Badge variant={map[status || ''] || 'secondary'}>
        {labels[status || ''] || status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewOrder(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <span className="font-bold text-lg">Aperçu de la facture</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleDownload(previewOrder)}>
                  <Download className="w-4 h-4 mr-2" />Imprimer/PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewOrder(null)}>Fermer</Button>
              </div>
            </div>
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(previewOrder) }}
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Facturation
              </CardTitle>
              <CardDescription>
                Générez, envoyez et partagez vos factures Bardahl
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono font-bold text-sm">{order.order_number}</div>
                        <div className="text-xs text-muted-foreground">
                          FAC-{order.order_number.replace('CMD-', '')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.created_at ? formatDate(order.created_at) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{formatPrice(order.total)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Aperçu"
                          onClick={() => setPreviewOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Télécharger / Imprimer PDF"
                          onClick={() => handleDownload(order)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Envoyer par email"
                          onClick={() => handleSendEmail(order)}
                          disabled={sendingEmail === order.id || !order.customer_email}
                        >
                          {sendingEmail === order.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Mail className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Partager via WhatsApp"
                          onClick={() => handleWhatsApp(order)}
                          disabled={!order.customer_phone}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
