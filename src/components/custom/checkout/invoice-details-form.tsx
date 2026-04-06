"use client"

import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react"

import type {
  InvoiceBillingDetails,
  InvoiceCustomerType,
} from "@/@types/invoice"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface InvoiceDetailsFormProps {
  value: InvoiceBillingDetails
  onChange: (value: InvoiceBillingDetails) => void
}

export function InvoiceDetailsForm({
  value,
  onChange,
}: InvoiceDetailsFormProps) {
  const setCustomerType = (customerType: InvoiceCustomerType) => {
    onChange({ ...value, customerType })
  }

  const updateIndividual = (
    field: keyof InvoiceBillingDetails["individual"],
    nextValue: string,
  ) => {
    onChange({
      ...value,
      individual: {
        ...value.individual,
        [field]: nextValue,
      },
    })
  }

  const updateCompany = (
    field: keyof InvoiceBillingDetails["company"],
    nextValue: string,
  ) => {
    onChange({
      ...value,
      company: {
        ...value.company,
        [field]: nextValue,
      },
    })
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <FileText className="h-5 w-5 text-lime-600" />
              Invoice Details
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Fill these billing details once. Admin will use them to send your
              invoice manually.
            </p>
          </div>
          <Badge className="bg-lime-100 text-lime-700 border-lime-200">
            Required
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              key: "INDIVIDUAL" as const,
              title: "Individual",
              icon: UserRound,
            },
            {
              key: "COMPANY" as const,
              title: "Company",
              icon: Building2,
            },
          ].map(({ key, title, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCustomerType(key)}
              className={cn(
                "rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                value.customerType === key
                  ? "border-lime-400 bg-lime-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-lime-300 hover:bg-lime-50/40",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    value.customerType === key
                      ? "bg-lime-100 text-lime-600"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{title}</div>
                  <div className="text-xs text-slate-500">
                    {key === "INDIVIDUAL"
                      ? "Personal invoice"
                      : "Business invoice"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {value.customerType === "INDIVIDUAL" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-name">Name</Label>
              <Input
                id="invoice-name"
                value={value.individual.name}
                onChange={(e) => updateIndividual("name", e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-surname">Surname</Label>
              <Input
                id="invoice-surname"
                value={value.individual.surname}
                onChange={(e) => updateIndividual("surname", e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="invoice-address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Address
              </Label>
              <Textarea
                id="invoice-address"
                value={value.individual.address}
                onChange={(e) => updateIndividual("address", e.target.value)}
                placeholder="Street, city, country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-vat">VAT</Label>
              <Input
                id="invoice-vat"
                value={value.individual.vat}
                onChange={(e) => updateIndividual("vat", e.target.value)}
                placeholder="EL123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                Email
              </Label>
              <Input
                id="invoice-email"
                value={value.individual.email}
                onChange={(e) => updateIndividual("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="invoice-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                Phone Number (optional)
              </Label>
              <Input
                id="invoice-phone"
                value={value.individual.phoneNumber}
                onChange={(e) => updateIndividual("phoneNumber", e.target.value)}
                placeholder="+30 6900000000"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={value.company.companyName}
                onChange={(e) => updateCompany("companyName", e.target.value)}
                placeholder="Acme Events Ltd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-activity">Business Activity</Label>
              <Input
                id="business-activity"
                value={value.company.businessActivity}
                onChange={(e) =>
                  updateCompany("businessActivity", e.target.value)
                }
                placeholder="Event planning and management"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Address
              </Label>
              <Textarea
                id="company-address"
                value={value.company.address}
                onChange={(e) => updateCompany("address", e.target.value)}
                placeholder="Street, city, country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal-code">Postal Code</Label>
              <Input
                id="postal-code"
                value={value.company.postalCode}
                onChange={(e) => updateCompany("postalCode", e.target.value)}
                placeholder="10558"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-vat">VAT</Label>
              <Input
                id="company-vat"
                value={value.company.vat}
                onChange={(e) => updateCompany("vat", e.target.value)}
                placeholder="EL987654321"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-office">Tax Office</Label>
              <Input
                id="tax-office"
                value={value.company.taxOffice}
                onChange={(e) => updateCompany("taxOffice", e.target.value)}
                placeholder="Athens Tax Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                Email
              </Label>
              <Input
                id="company-email"
                value={value.company.email}
                onChange={(e) => updateCompany("email", e.target.value)}
                placeholder="billing@acme.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                Phone Number (optional)
              </Label>
              <Input
                id="company-phone"
                value={value.company.phoneNumber}
                onChange={(e) => updateCompany("phoneNumber", e.target.value)}
                placeholder="+30 2100000000"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
