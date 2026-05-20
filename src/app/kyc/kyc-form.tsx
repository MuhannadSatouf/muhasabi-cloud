"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { inputFieldClass } from "../../components/ui/field-classes";

type Locale = "en" | "ar";

export type InitialKyc = {
  status: string | null;
  applicantFullName: string;
  applicantDateOfBirth: string;
  applicantNationality: string;
  applicantResidenceCountry: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantAddressLine1: string;
  applicantAddressLine2: string;
  applicantCity: string;
  applicantRegion: string;
  applicantPostalCode: string;
  applicantIdType: string;
  applicantIdTypeOther: string;
  applicantIdNumber: string;
  applicantIsPep: boolean;
  actingOnBehalfOfAnother: boolean;
  businessLegalName: string;
  businessType: string;
  registrationCountry: string;
  registrationNumber: string;
  taxNumber: string;
  businessAddress: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessCity: string;
  businessRegion: string;
  businessPostalCode: string;
  businessAddressCountry: string;
  website: string;
  serviceType: string;
  expectedClientCompanies: number | "";
  expectedMonthlyTransactions: number | "";
  servesSanctionedCountries: boolean;
  highRiskIndustries: string[];
  ownerFullName: string;
  ownerOwnershipPercentage: number | "";
  ownerNationality: string;
  ownerResidenceCountry: string;
  ownerIsPep: boolean;
};

const text = {
  en: {
    identity: "Accountant identity",
    business: "Workspace business profile",
    owner: "Beneficial owner",
    risk: "Risk declaration",
    submit: "Submit KYC",
    submitting: "Submitting...",
    saved: "KYC submitted. Redirecting...",
    error: "Please review the required fields and try again.",
    required: "Required",
    optional: "Optional",
    select: "Select...",
    fullName: "Full legal name",
    dob: "Date of birth",
    nationality: "Nationality",
    residence: "Country of residence",
    phone: "Phone number",
    addressLine1: "Street address",
    addressLine2: "Apartment, suite, floor",
    city: "City",
    region: "State / Province",
    postalCode: "Postal code",
    idType: "Government ID type",
    idOther: "Describe the other ID type",
    idNumber: "Government ID number",
    pep: "Politically exposed person",
    behalf: "Acting on behalf of another person",
    legalName: "Workspace legal name",
    businessType: "Business type",
    regCountry: "Registration country",
    regNumber: "Registration number",
    taxNumber: "Tax number",
    businessAddress: "Business operating address",
    businessAddressCountry: "Business address country",
    website: "Website",
    serviceType: "Main service type",
    clients: "Expected client companies",
    transactions: "Expected monthly transactions",
    sanctioned: "Serves clients in sanctioned countries",
    highRisk: "High-risk industries served",
    confirm: "I confirm this information is accurate and will be updated when it changes.",
    terms: "I accept Muhasabi Cloud compliance terms.",
    ownership: "Ownership percentage",
    yes: "Yes",
    no: "No",
    individual: "Individual accountant",
    office: "Accounting office",
    company: "Company",
    other: "Other",
    nationalId: "National ID",
    passport: "Passport",
    residencePermit: "Residence permit",
    regRequiredHint: "Required for accounting offices and companies.",
    encryptedHint:
      "Phone, address details, ID, tax, and registration values are encrypted before storage.",
  },
  ar: {
    identity: "هوية المحاسب",
    business: "بيانات مساحة العمل",
    owner: "المالك المستفيد",
    risk: "إقرار المخاطر",
    submit: "إرسال بيانات KYC",
    submitting: "جار الإرسال...",
    saved: "تم إرسال بيانات KYC. جار التحويل...",
    error: "يرجى مراجعة الحقول المطلوبة والمحاولة مرة أخرى.",
    required: "مطلوب",
    optional: "اختياري",
    select: "اختر...",
    fullName: "الاسم القانوني الكامل",
    dob: "تاريخ الميلاد",
    nationality: "الجنسية",
    residence: "بلد الإقامة",
    phone: "رقم الهاتف",
    addressLine1: "الشارع ورقم البناء",
    addressLine2: "الشقة أو الطابق",
    city: "المدينة",
    region: "المحافظة / الولاية",
    postalCode: "الرمز البريدي",
    idType: "نوع الوثيقة الحكومية",
    idOther: "اشرح نوع الوثيقة الأخرى",
    idNumber: "رقم الوثيقة الحكومية",
    pep: "شخص معرض سياسيا",
    behalf: "أتصرف نيابة عن شخص آخر",
    legalName: "الاسم القانوني لمساحة العمل",
    businessType: "نوع النشاط",
    regCountry: "بلد التسجيل",
    regNumber: "رقم التسجيل",
    taxNumber: "الرقم الضريبي",
    businessAddress: "عنوان ممارسة النشاط",
    businessAddressCountry: "بلد عنوان النشاط",
    website: "الموقع الإلكتروني",
    serviceType: "نوع الخدمة الرئيسي",
    clients: "عدد الشركات العميلة المتوقع",
    transactions: "عدد العمليات الشهرية المتوقع",
    sanctioned: "تخدم عملاء في دول خاضعة لعقوبات",
    highRisk: "قطاعات عالية المخاطر يتم خدمتها",
    confirm: "أؤكد أن هذه المعلومات صحيحة وسأقوم بتحديثها عند حدوث أي تغيير.",
    terms: "أوافق على شروط الامتثال في محاسبي كلاود.",
    ownership: "نسبة الملكية",
    yes: "نعم",
    no: "لا",
    individual: "محاسب فردي",
    office: "مكتب محاسبة",
    company: "شركة",
    other: "أخرى",
    nationalId: "هوية وطنية",
    passport: "جواز سفر",
    residencePermit: "إقامة",
    regRequiredHint: "مطلوب لمكاتب المحاسبة والشركات.",
    encryptedHint:
      "يتم تشفير الهاتف وتفاصيل العنوان والهوية والضرائب والتسجيل قبل التخزين.",
  },
} as const;

const highRiskOptions = [
  { value: "crypto", en: "Crypto", ar: "العملات الرقمية" },
  { value: "gambling", en: "Gambling", ar: "المقامرة" },
  { value: "weapons", en: "Weapons", ar: "الأسلحة" },
  { value: "money_services", en: "Money services", ar: "خدمات تحويل الأموال" },
  { value: "charities_ngos", en: "Charities or NGOs", ar: "الجمعيات والمنظمات" },
  { value: "political_clients", en: "Political clients", ar: "عملاء سياسيون" },
];

const REGION_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW",
  "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM",
  "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD",
  "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW",
  "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH",
  "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE",
  "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU",
  "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN",
  "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI",
  "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR",
  "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX",
  "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU",
  "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS",
  "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD",
  "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST",
  "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM",
  "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ",
  "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM",
  "ZW",
];

function countryOptions(locale: Locale) {
  const primary = new Intl.DisplayNames([locale], { type: "region" });
  const secondary = new Intl.DisplayNames([locale === "ar" ? "en" : "ar"], {
    type: "region",
  });

  return REGION_CODES
    .map((code) => ({
      code,
      label: `${primary.of(code)} / ${secondary.of(code)}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

function boolValue(fd: FormData, name: string) {
  return fd.get(name) === "true";
}

function firstApiError(error: unknown, fallback: string) {
  if (typeof error === "string") return error;

  if (!error || typeof error !== "object") return fallback;

  const entries = Object.entries(error as Record<string, unknown>);
  const first = entries.find(([, value]) => Array.isArray(value) && value.length > 0);

  if (!first) return fallback;

  const [field, messages] = first;
  return `${field}: ${(messages as unknown[]).join(", ")}`;
}

function requirement(locale: Locale, required: boolean) {
  return required ? text[locale].required : text[locale].optional;
}

function Field({
  label,
  name,
  locale,
  type = "text",
  defaultValue,
  required = true,
  maxLength,
  min,
  max,
  hint,
}: {
  label: string;
  name: string;
  locale: Locale;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {requirement(locale, required)}
        </span>
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        className={inputFieldClass}
      />
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function CountrySelect({
  label,
  name,
  locale,
  defaultValue,
}: {
  label: string;
  name: string;
  locale: Locale;
  defaultValue?: string;
}) {
  const t = text[locale];
  const options = useMemo(() => countryOptions(locale), [locale]);

  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted-foreground">{t.required}</span>
      </span>
      <select name={name} defaultValue={defaultValue} required className={inputFieldClass}>
        <option value="">{t.select}</option>
        {options.map((country) => (
          <option key={country.code} value={country.code}>
            {country.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function YesNo({
  label,
  name,
  defaultValue,
  locale,
}: {
  label: string;
  name: string;
  defaultValue: boolean;
  locale: Locale;
}) {
  const t = text[locale];

  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted-foreground">{t.required}</span>
      </span>
      <select name={name} defaultValue={String(defaultValue)} className={inputFieldClass}>
        <option value="false">{t.no}</option>
        <option value="true">{t.yes}</option>
      </select>
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

export function KycForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial: InitialKyc;
}) {
  const router = useRouter();
  const t = text[locale];
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [idType, setIdType] = useState(initial.applicantIdType || "NATIONAL_ID");
  const [businessType, setBusinessType] = useState(
    initial.businessType || "INDIVIDUAL_ACCOUNTANT"
  );
  const isRegisteredBusiness =
    businessType === "ACCOUNTING_OFFICE" || businessType === "COMPANY";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setPending(true);

    const fd = new FormData(e.currentTarget);

    const payload = {
      applicantFullName: String(fd.get("applicantFullName") ?? ""),
      applicantDateOfBirth: String(fd.get("applicantDateOfBirth") ?? ""),
      applicantNationality: String(fd.get("applicantNationality") ?? ""),
      applicantResidenceCountry: String(fd.get("applicantResidenceCountry") ?? ""),
      applicantPhone: String(fd.get("applicantPhone") ?? ""),
      applicantAddressLine1: String(fd.get("applicantAddressLine1") ?? ""),
      applicantAddressLine2: String(fd.get("applicantAddressLine2") ?? ""),
      applicantCity: String(fd.get("applicantCity") ?? ""),
      applicantRegion: String(fd.get("applicantRegion") ?? ""),
      applicantPostalCode: String(fd.get("applicantPostalCode") ?? ""),
      applicantIdType: String(fd.get("applicantIdType") ?? "NATIONAL_ID"),
      applicantIdTypeOther: String(fd.get("applicantIdTypeOther") ?? ""),
      applicantIdNumber: String(fd.get("applicantIdNumber") ?? ""),
      applicantIsPep: boolValue(fd, "applicantIsPep"),
      actingOnBehalfOfAnother: boolValue(fd, "actingOnBehalfOfAnother"),
      businessLegalName: String(fd.get("businessLegalName") ?? ""),
      businessType: String(fd.get("businessType") ?? "INDIVIDUAL_ACCOUNTANT"),
      registrationCountry: String(fd.get("registrationCountry") ?? ""),
      registrationNumber: String(fd.get("registrationNumber") ?? ""),
      taxNumber: String(fd.get("taxNumber") ?? ""),
      businessAddressLine1: String(fd.get("businessAddressLine1") ?? ""),
      businessAddressLine2: String(fd.get("businessAddressLine2") ?? ""),
      businessCity: String(fd.get("businessCity") ?? ""),
      businessRegion: String(fd.get("businessRegion") ?? ""),
      businessPostalCode: String(fd.get("businessPostalCode") ?? ""),
      businessAddressCountry: String(fd.get("businessAddressCountry") ?? ""),
      website: String(fd.get("website") ?? ""),
      serviceType: String(fd.get("serviceType") ?? ""),
      expectedClientCompanies: Number(fd.get("expectedClientCompanies") ?? 0),
      expectedMonthlyTransactions: Number(fd.get("expectedMonthlyTransactions") ?? 0),
      servesSanctionedCountries: boolValue(fd, "servesSanctionedCountries"),
      highRiskIndustries: fd.getAll("highRiskIndustries").map(String),
      informationConfirmed: fd.get("informationConfirmed") === "on",
      termsAccepted: fd.get("termsAccepted") === "on",
      beneficialOwners: [
        {
          fullName: String(fd.get("ownerFullName") ?? ""),
          ownershipPercentage: Number(fd.get("ownerOwnershipPercentage") ?? 0),
          nationality: String(fd.get("ownerNationality") ?? ""),
          residenceCountry: String(fd.get("ownerResidenceCountry") ?? ""),
          isPep: boolValue(fd, "ownerIsPep"),
        },
      ],
    };

    const res = await fetch("/api/kyc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setPending(false);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(firstApiError(data?.error, t.error));
      return;
    }

    setSuccess(t.saved);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted-foreground">{t.encryptedHint}</p>

      <Section title={t.identity}>
        <Field label={t.fullName} name="applicantFullName" locale={locale} defaultValue={initial.applicantFullName} />
        <Field label={t.dob} name="applicantDateOfBirth" locale={locale} type="date" defaultValue={initial.applicantDateOfBirth} />
        <CountrySelect label={t.nationality} name="applicantNationality" locale={locale} defaultValue={initial.applicantNationality} />
        <CountrySelect label={t.residence} name="applicantResidenceCountry" locale={locale} defaultValue={initial.applicantResidenceCountry} />
        <Field label={t.phone} name="applicantPhone" locale={locale} type="tel" defaultValue={initial.applicantPhone} maxLength={30} />
        <Field label={t.addressLine1} name="applicantAddressLine1" locale={locale} defaultValue={initial.applicantAddressLine1 || initial.applicantAddress} maxLength={120} />
        <Field label={t.addressLine2} name="applicantAddressLine2" locale={locale} defaultValue={initial.applicantAddressLine2} required={false} maxLength={120} />
        <Field label={t.city} name="applicantCity" locale={locale} defaultValue={initial.applicantCity} maxLength={80} />
        <Field label={t.region} name="applicantRegion" locale={locale} defaultValue={initial.applicantRegion} required={false} maxLength={80} />
        <Field label={t.postalCode} name="applicantPostalCode" locale={locale} defaultValue={initial.applicantPostalCode} required={false} maxLength={30} />
        <label className="block space-y-1.5">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
            <span>{t.idType}</span>
            <span className="text-xs font-normal text-muted-foreground">{t.required}</span>
          </span>
          <select
            name="applicantIdType"
            value={idType}
            onChange={(event) => setIdType(event.target.value)}
            className={inputFieldClass}
          >
            <option value="NATIONAL_ID">{t.nationalId}</option>
            <option value="PASSPORT">{t.passport}</option>
            <option value="RESIDENCE_PERMIT">{t.residencePermit}</option>
            <option value="OTHER">{t.other}</option>
          </select>
        </label>
        {idType === "OTHER" ? (
          <Field
            label={t.idOther}
            name="applicantIdTypeOther"
            locale={locale}
            defaultValue={initial.applicantIdTypeOther}
            maxLength={120}
          />
        ) : null}
        <Field label={t.idNumber} name="applicantIdNumber" locale={locale} defaultValue={initial.applicantIdNumber} maxLength={80} />
        <YesNo label={t.pep} name="applicantIsPep" defaultValue={initial.applicantIsPep} locale={locale} />
        <YesNo label={t.behalf} name="actingOnBehalfOfAnother" defaultValue={initial.actingOnBehalfOfAnother} locale={locale} />
      </Section>

      <Section title={t.business}>
        <Field label={t.legalName} name="businessLegalName" locale={locale} defaultValue={initial.businessLegalName} />
        <label className="block space-y-1.5">
          <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
            <span>{t.businessType}</span>
            <span className="text-xs font-normal text-muted-foreground">{t.required}</span>
          </span>
          <select
            name="businessType"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            className={inputFieldClass}
          >
            <option value="INDIVIDUAL_ACCOUNTANT">{t.individual}</option>
            <option value="ACCOUNTING_OFFICE">{t.office}</option>
            <option value="COMPANY">{t.company}</option>
            <option value="OTHER">{t.other}</option>
          </select>
        </label>
        <CountrySelect label={t.regCountry} name="registrationCountry" locale={locale} defaultValue={initial.registrationCountry} />
        <Field
          label={t.regNumber}
          name="registrationNumber"
          locale={locale}
          defaultValue={initial.registrationNumber}
          required={isRegisteredBusiness}
          maxLength={80}
          hint={t.regRequiredHint}
        />
        <Field label={t.taxNumber} name="taxNumber" locale={locale} defaultValue={initial.taxNumber} required={false} maxLength={80} />
        <CountrySelect label={t.businessAddressCountry} name="businessAddressCountry" locale={locale} defaultValue={initial.businessAddressCountry || initial.registrationCountry} />
        <Field label={t.addressLine1} name="businessAddressLine1" locale={locale} defaultValue={initial.businessAddressLine1 || initial.businessAddress} maxLength={120} />
        <Field label={t.addressLine2} name="businessAddressLine2" locale={locale} defaultValue={initial.businessAddressLine2} required={false} maxLength={120} />
        <Field label={t.city} name="businessCity" locale={locale} defaultValue={initial.businessCity} maxLength={80} />
        <Field label={t.region} name="businessRegion" locale={locale} defaultValue={initial.businessRegion} required={false} maxLength={80} />
        <Field label={t.postalCode} name="businessPostalCode" locale={locale} defaultValue={initial.businessPostalCode} required={false} maxLength={30} />
        <Field label={t.website} name="website" locale={locale} type="url" defaultValue={initial.website} required={false} />
        <Field label={t.serviceType} name="serviceType" locale={locale} defaultValue={initial.serviceType} maxLength={120} />
        <Field label={t.clients} name="expectedClientCompanies" locale={locale} type="number" defaultValue={initial.expectedClientCompanies} min={0} max={100000} />
        <Field label={t.transactions} name="expectedMonthlyTransactions" locale={locale} type="number" defaultValue={initial.expectedMonthlyTransactions} min={0} max={10000000} />
      </Section>

      <Section title={t.owner}>
        <Field label={t.fullName} name="ownerFullName" locale={locale} defaultValue={initial.ownerFullName} />
        <Field label={t.ownership} name="ownerOwnershipPercentage" locale={locale} type="number" defaultValue={initial.ownerOwnershipPercentage} min={0} max={100} />
        <CountrySelect label={t.nationality} name="ownerNationality" locale={locale} defaultValue={initial.ownerNationality} />
        <CountrySelect label={t.residence} name="ownerResidenceCountry" locale={locale} defaultValue={initial.ownerResidenceCountry} />
        <YesNo label={t.pep} name="ownerIsPep" defaultValue={initial.ownerIsPep} locale={locale} />
      </Section>

      <Card>
        <CardHeader>
          <CardTitle>{t.risk}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <YesNo label={t.sanctioned} name="servesSanctionedCountries" defaultValue={initial.servesSanctionedCountries} locale={locale} />
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">{t.highRisk}</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {highRiskOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    name="highRiskIndustries"
                    value={option.value}
                    defaultChecked={initial.highRiskIndustries.includes(option.value)}
                  />
                  <span>{locale === "ar" ? `${option.ar} / ${option.en}` : `${option.en} / ${option.ar}`}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" name="informationConfirmed" required className="mt-1" defaultChecked={initial.status === "APPROVED"} />
            <span>{t.confirm}</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" name="termsAccepted" required className="mt-1" defaultChecked={initial.status === "APPROVED"} />
            <span>{t.terms}</span>
          </label>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
      </div>
    </form>
  );
}
