export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

type DirectionType = "ltr" | "rtl";

interface DictionaryShape {
  locale: Locale;
  direction: DirectionType;
  common: { [k: string]: string };
  nav: { [k: string]: string };
  auth: { [k: string]: string };
  landing: { [k: string]: string };
  onboarding: { [k: string]: string };
  dashboard: { [k: string]: string };
  invoices: {
    title: string;
    new: string;
    number: string;
    customer: string;
    issueDate: string;
    amount: string;
    addItem: string;
    removeItem: string;
    description: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    pickCustomer: string;
    pickProduct: string;
    downloadPdf: string;
    markPaid: string;
    markSent: string;
    markDraft: string;
    markVoid: string;
    emptyTitle: string;
    emptyBody: string;
    status: { draft: string; sent: string; paid: string; void: string };
  };
  products: { [k: string]: string };
  customers: { [k: string]: string };
  settings: { [k: string]: string };
}

export const dictionaries: Record<Locale, DictionaryShape> = {
  en: {
    locale: "en",
    direction: "ltr",
    common: {
      appName: "Fawtara",
      tagline: "Saudi VAT invoicing and inventory, in one place.",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      back: "Back",
      next: "Next",
      search: "Search",
      loading: "Loading…",
      empty: "Nothing here yet.",
      yes: "Yes",
      no: "No",
      actions: "Actions",
      status: "Status",
      total: "Total",
      subtotal: "Subtotal",
      vat: "VAT",
      vatRate: "VAT rate",
      currency: "Currency",
      date: "Date",
      dueDate: "Due date",
      notes: "Notes",
      required: "Required",
    },
    nav: {
      dashboard: "Dashboard",
      invoices: "Invoices",
      products: "Products",
      customers: "Customers",
      settings: "Settings",
      signOut: "Sign out",
    },
    auth: {
      signIn: "Sign in",
      signInTitle: "Welcome back",
      signInSubtitle: "Sign in to manage your invoices and inventory.",
      signUp: "Create account",
      signUpTitle: "Create your account",
      signUpSubtitle: "Start issuing VAT-compliant invoices in minutes.",
      email: "Email",
      password: "Password",
      noAccount: "No account?",
      haveAccount: "Already have an account?",
      checkEmail: "Check your email to confirm your account.",
      invalidCredentials: "Invalid email or password.",
    },
    landing: {
      heroTitle: "Invoicing for Saudi businesses, without the friction.",
      heroSub: "Issue VAT-compliant invoices in Arabic and English, track your inventory, and see your revenue at a glance.",
      ctaStart: "Get started",
      ctaSignIn: "Sign in",
      featureA: "Bilingual invoices",
      featureADesc: "Generate VAT-compliant invoices in Arabic and English with one click.",
      featureB: "Inventory tracking",
      featureBDesc: "Keep stock counts up to date as you issue invoices.",
      featureC: "Revenue at a glance",
      featureCDesc: "See monthly revenue, recent invoices, and product performance.",
    },
    onboarding: {
      title: "Set up your company",
      subtitle: "We'll use this on your invoices and inside your dashboard.",
      orgName: "Company name",
      orgNameAr: "Company name (Arabic)",
      vatNumber: "VAT number",
      crNumber: "Commercial registration",
      address: "Address",
      city: "City",
      phone: "Phone",
      finish: "Finish setup",
    },
    dashboard: {
      title: "Overview",
      revenue: "Revenue",
      revenueThisMonth: "Revenue this month",
      invoicesThisMonth: "Invoices this month",
      outstanding: "Outstanding",
      paid: "Paid",
      inventoryItems: "Inventory items",
      recentInvoices: "Recent invoices",
      noInvoices: "No invoices yet. Create your first one.",
      monthlyRevenue: "Monthly revenue",
    },
    invoices: {
      title: "Invoices",
      new: "New invoice",
      number: "Number",
      customer: "Customer",
      issueDate: "Issue date",
      amount: "Amount",
      addItem: "Add line item",
      removeItem: "Remove",
      description: "Description",
      quantity: "Quantity",
      unitPrice: "Unit price",
      lineTotal: "Line total",
      pickCustomer: "Select a customer",
      pickProduct: "Pick a product (optional)",
      downloadPdf: "Download PDF",
      markPaid: "Mark as paid",
      markSent: "Mark as sent",
      markDraft: "Move to draft",
      markVoid: "Void invoice",
      status: {
        draft: "Draft",
        sent: "Sent",
        paid: "Paid",
        void: "Void",
      },
      emptyTitle: "No invoices yet",
      emptyBody: "Create your first invoice to start tracking revenue.",
    },
    products: {
      title: "Products",
      new: "New product",
      sku: "SKU",
      name: "Name",
      nameAr: "Name (Arabic)",
      price: "Price",
      stock: "Stock",
      unit: "Unit",
      active: "Active",
      emptyTitle: "No products yet",
      emptyBody: "Add products to use them on invoices and track stock.",
    },
    customers: {
      title: "Customers",
      new: "New customer",
      name: "Name",
      nameAr: "Name (Arabic)",
      vatNumber: "VAT number",
      email: "Email",
      phone: "Phone",
      city: "City",
      emptyTitle: "No customers yet",
      emptyBody: "Add a customer to start issuing invoices.",
    },
    settings: {
      title: "Settings",
      company: "Company",
      tax: "Tax",
      vatRate: "Default VAT rate",
      invoicePrefix: "Invoice prefix",
      zatca: "Show ZATCA-style QR on invoices",
      saved: "Settings saved.",
    },
  },
  ar: {
    locale: "ar",
    direction: "rtl",
    common: {
      appName: "فوترة",
      tagline: "فوترة ضريبة القيمة المضافة وإدارة المخزون في مكان واحد.",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      create: "إنشاء",
      back: "رجوع",
      next: "التالي",
      search: "بحث",
      loading: "جارٍ التحميل…",
      empty: "لا يوجد شيء هنا بعد.",
      yes: "نعم",
      no: "لا",
      actions: "الإجراءات",
      status: "الحالة",
      total: "الإجمالي",
      subtotal: "المجموع الفرعي",
      vat: "ضريبة القيمة المضافة",
      vatRate: "نسبة الضريبة",
      currency: "العملة",
      date: "التاريخ",
      dueDate: "تاريخ الاستحقاق",
      notes: "ملاحظات",
      required: "مطلوب",
    },
    nav: {
      dashboard: "لوحة التحكم",
      invoices: "الفواتير",
      products: "المنتجات",
      customers: "العملاء",
      settings: "الإعدادات",
      signOut: "تسجيل الخروج",
    },
    auth: {
      signIn: "تسجيل الدخول",
      signInTitle: "مرحبًا بعودتك",
      signInSubtitle: "سجّل الدخول لإدارة فواتيرك ومخزونك.",
      signUp: "إنشاء حساب",
      signUpTitle: "أنشئ حسابك",
      signUpSubtitle: "ابدأ بإصدار فواتير ضريبية متوافقة خلال دقائق.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      noAccount: "ليس لديك حساب؟",
      haveAccount: "لديك حساب بالفعل؟",
      checkEmail: "تحقق من بريدك الإلكتروني لتأكيد الحساب.",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    },
    landing: {
      heroTitle: "فوترة بسيطة للأعمال السعودية.",
      heroSub: "أصدر فواتير ضريبية بالعربية والإنجليزية، وتابع مخزونك وإيراداتك من مكان واحد.",
      ctaStart: "ابدأ الآن",
      ctaSignIn: "تسجيل الدخول",
      featureA: "فواتير ثنائية اللغة",
      featureADesc: "أنشئ فواتير متوافقة مع ضريبة القيمة المضافة بالعربية والإنجليزية بنقرة واحدة.",
      featureB: "متابعة المخزون",
      featureBDesc: "حافظ على دقة كميات المخزون أثناء إصدار الفواتير.",
      featureC: "نظرة على الإيرادات",
      featureCDesc: "تابع الإيرادات الشهرية، الفواتير الأخيرة، وأداء المنتجات.",
    },
    onboarding: {
      title: "أعد إعدادات شركتك",
      subtitle: "سنستخدم هذه البيانات في فواتيرك ولوحة التحكم.",
      orgName: "اسم الشركة",
      orgNameAr: "اسم الشركة بالعربية",
      vatNumber: "الرقم الضريبي",
      crNumber: "السجل التجاري",
      address: "العنوان",
      city: "المدينة",
      phone: "الهاتف",
      finish: "إنهاء الإعداد",
    },
    dashboard: {
      title: "نظرة عامة",
      revenue: "الإيرادات",
      revenueThisMonth: "إيرادات هذا الشهر",
      invoicesThisMonth: "فواتير هذا الشهر",
      outstanding: "المستحق",
      paid: "مدفوع",
      inventoryItems: "عناصر المخزون",
      recentInvoices: "أحدث الفواتير",
      noInvoices: "لا توجد فواتير بعد. أنشئ أول فاتورة.",
      monthlyRevenue: "الإيرادات الشهرية",
    },
    invoices: {
      title: "الفواتير",
      new: "فاتورة جديدة",
      number: "الرقم",
      customer: "العميل",
      issueDate: "تاريخ الإصدار",
      amount: "المبلغ",
      addItem: "إضافة بند",
      removeItem: "حذف",
      description: "الوصف",
      quantity: "الكمية",
      unitPrice: "سعر الوحدة",
      lineTotal: "إجمالي البند",
      pickCustomer: "اختر عميلًا",
      pickProduct: "اختر منتجًا (اختياري)",
      downloadPdf: "تنزيل PDF",
      markPaid: "تعيين كمدفوعة",
      markSent: "تعيين كمرسلة",
      markDraft: "نقل إلى المسودات",
      markVoid: "إلغاء الفاتورة",
      status: {
        draft: "مسودة",
        sent: "مُرسلة",
        paid: "مدفوعة",
        void: "ملغاة",
      },
      emptyTitle: "لا توجد فواتير بعد",
      emptyBody: "أنشئ أول فاتورة لبدء متابعة الإيرادات.",
    },
    products: {
      title: "المنتجات",
      new: "منتج جديد",
      sku: "SKU",
      name: "الاسم",
      nameAr: "الاسم بالعربية",
      price: "السعر",
      stock: "المخزون",
      unit: "الوحدة",
      active: "نشط",
      emptyTitle: "لا توجد منتجات بعد",
      emptyBody: "أضف منتجات لاستخدامها في الفواتير ومتابعة المخزون.",
    },
    customers: {
      title: "العملاء",
      new: "عميل جديد",
      name: "الاسم",
      nameAr: "الاسم بالعربية",
      vatNumber: "الرقم الضريبي",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      city: "المدينة",
      emptyTitle: "لا يوجد عملاء بعد",
      emptyBody: "أضف عميلاً لبدء إصدار الفواتير.",
    },
    settings: {
      title: "الإعدادات",
      company: "الشركة",
      tax: "الضريبة",
      vatRate: "نسبة الضريبة الافتراضية",
      invoicePrefix: "بادئة رقم الفاتورة",
      zatca: "إظهار رمز QR على نمط ZATCA",
      saved: "تم حفظ الإعدادات.",
    },
  },
};

export type Dictionary = DictionaryShape;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
