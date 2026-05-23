"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tag, Plus, Search, Trash2 } from "lucide-react"
import { SearchCombobox } from "@/components/search-combobox"
import { SERVICES } from "@/lib/appointments-data"
import { fmtCurrency } from "@/lib/date-utils"

interface ServiceItem {
  id: string
  name: string
  qty: number
  unit: string
  price: number
  type: "vip" | "thuong" | "khuyenmai"
}

interface ServicesTableProps {
  items: ServiceItem[]
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>
  discount: number
  setDiscount: (discount: number) => void
}

export function ServicesTable({
  items,
  setItems,
  discount,
  setDiscount
}: ServicesTableProps) {

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const finalPrice = Math.max(0, totalPrice - discount)

  const addItem = () => {
    setItems(prev => [
      ...prev, 
      { id: Math.random().toString(), name: "", qty: 1, unit: "lần", price: 0, type: "thuong" }
    ])
  }

  const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }
  
  const updateItemFields = (id: string, updates: Partial<ServiceItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          <h2 className="font-bold text-sm text-on-surface">Dịch vụ & Chi phí</h2>
        </div>
        <Button 
          type="button"
          onClick={addItem} 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary rounded-lg border border-primary/20 bg-primary/5"
        >
          <Plus className="size-3.5 mr-1" />
          Thêm dịch vụ
        </Button>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b border-outline-variant/10">
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 w-full">Dịch vụ / Vật tư</th>
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 whitespace-nowrap pl-4 w-24 text-center">SL</th>
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4 w-40">Đơn giá</th>
              <th className="text-[10px] font-bold text-on-surface-variant/50 uppercase pb-3 text-right whitespace-nowrap pl-4 w-40">Thành tiền</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-on-surface-variant/40 italic bg-slate-50/50">
                  Chưa có dịch vụ nào được thêm. Nhấn "Thêm dịch vụ" để bắt đầu.
                </td>
              </tr>
            ) : items.map((item) => (
              <tr key={item.id} className="group">
                <td className="py-2.5 pr-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchCombobox
                        items={SERVICES.map(s => ({ id: s.id, name: s.name }))}
                        value={item.name ? { id: item.id.toString(), name: item.name } : null}
                        onSelect={(selected) => {
                          if (selected) {
                            const svc = SERVICES.find(s => s.id === selected.id)
                            if (svc) {
                              const t = item.type || "thuong"
                              updateItemFields(item.id, {
                                name: svc.name,
                                type: t,
                                qty: 1,
                                price: svc.price[t as keyof typeof svc.price]
                              })
                            }
                          } else {
                            updateItemFields(item.id, { name: "", price: 0, qty: 0 })
                          }
                        }}
                        placeholder="Tìm dịch vụ..."
                        icon={Search}
                        containerClassName="h-9 text-xs rounded-lg"
                        iconClassName="left-3 size-3.5"
                        inputClassName="pl-9 pr-8"
                        renderItem={(s) => (
                          <div className="flex items-center w-full">
                            <span className="font-medium text-on-surface truncate">{s.name}</span>
                          </div>
                        )}
                      />
                    </div>
                    <Select 
                      value={item.type} 
                      onValueChange={v => {
                        const svc = SERVICES.find(s => s.name === item.name)
                        if (svc) {
                          updateItemFields(item.id, { type: v as any, price: svc.price[v as keyof typeof svc.price] })
                        } else {
                          updateItem(item.id, "type", v)
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 w-[110px] text-[10px] font-bold uppercase tracking-wider bg-slate-50 border-transparent focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thuong">Thường</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="khuyenmai">Khuyến mãi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </td>
                <td className="py-2.5 pl-4">
                  <Input 
                    type="number" 
                    min="1" 
                    value={item.qty || ""} 
                    onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} 
                    className="w-14 h-9 text-xs font-mono text-center bg-slate-50 border-transparent focus-visible:ring-primary/20"
                  />
                </td>
                <td className="py-2.5 pl-4 text-right text-xs font-mono font-medium text-on-surface-variant whitespace-nowrap">
                  {item.price > 0 ? fmtCurrency(item.price) : "—"}
                </td>
                <td className="py-2.5 pl-4 text-right text-xs font-bold text-on-surface whitespace-nowrap">
                  {fmtCurrency(item.price * item.qty)}
                </td>
                <td className="py-2.5 pl-2 text-right">
                  <button 
                    type="button"
                    onClick={() => removeItem(item.id)} 
                    className="p-2 text-on-surface-variant/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 pb-6 pt-2 mt-auto">
        <div className="rounded-2xl bg-slate-50 p-5 space-y-3 w-full sm:w-[320px] ml-auto border border-outline-variant/10">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant/60 font-medium">Tổng dịch vụ</span>
            <span className="font-bold">{fmtCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-600 font-medium">Giảm giá</span>
            <Input 
              type="number" 
              min="0"
              step="50000"
              value={discount || ""} 
              onChange={e => setDiscount(parseInt(e.target.value) || 0)} 
              placeholder="0"
              className="h-8 w-28 text-xs font-mono text-right bg-white border-outline-variant/20 focus-visible:ring-primary/20 text-emerald-700 font-bold"
            />
          </div>
          <div className="flex justify-between items-center text-sm font-bold border-t border-outline-variant/10 pt-3 mt-3">
            <span className="text-on-surface uppercase tracking-wider text-[10px]">Tổng thanh toán</span>
            <span className="text-primary text-base">{fmtCurrency(finalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
