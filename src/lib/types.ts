export type Role = "owner" | "admin" | "member";
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  vat_number: string | null;
  cr_number: string | null;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  vat_rate: number;
  invoice_prefix: string;
  invoice_counter: number;
  logo_url: string | null;
  zatca_qr_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  sku: string | null;
  name: string;
  name_ar: string | null;
  description: string | null;
  unit_price: number;
  stock_qty: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  name_ar: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  description_ar: string | null;
  quantity: number;
  unit_price: number;
  line_subtotal: number;
  line_vat: number;
  line_total: number;
  position: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  customer_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  currency: string;
  notes: string | null;
  subtotal: number;
  vat_total: number;
  total: number;
  vat_rate: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithRelations extends Invoice {
  customer: Customer | null;
  items: InvoiceItem[];
}
