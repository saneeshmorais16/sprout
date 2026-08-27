"use client";
import { useState } from "react";
import { Info, MousePointer2 } from "lucide-react";
const fields=[
  {key:"gross",label:"Gross pay",value:"£2,400.00",copy:"The amount earned before deductions are taken."},
  {key:"tax",label:"Income Tax",value:"−£250.20",copy:"Tax on income. The exact amount depends on pay, tax code and personal circumstances."},
  {key:"ni",label:"National Insurance",value:"−£108.16",copy:"A deduction that may apply depending on earnings and current rules."},
  {key:"pension",label:"Pension contribution",value:"−£72.00",copy:"Money going into this fictional employee's workplace pension. Arrangements vary."},
  {key:"loan",label:"Student loan",value:"−£24.00",copy:"A repayment may apply above the relevant threshold, depending on the person and their plan."},
  {key:"net",label:"Net pay",value:"£1,945.64",copy:"The amount that reaches the bank account after deductions in this example."},
];
export function PayslipDecoder(){const[selected,setSelected]=useState("gross");const active=fields.find(item=>item.key===selected)!;return <div className="payslip-flow"><section className="decoder-intro"><span className="page-kicker"><MousePointer2/> Tap to decode</span><h1>Your payslip, in plain English</h1><p>This is a fictional UK-style example. Tap any row to understand what it means.</p></section><article className="payslip"><header><div><strong>NORTHSTAR STUDIO LTD</strong><small>Illustrative payslip · August</small></div><span>EMP 024</span></header><div className="payslip-person"><span>Employee</span><strong>Maya Patel</strong><span>Tax code</span><strong>1257L · example only</strong></div><div className="payslip-fields">{fields.map(field=><button key={field.key} onClick={()=>setSelected(field.key)} className={selected===field.key?"active":""}><span>{field.label}</span><strong>{field.value}</strong><Info/></button>)}</div></article><section className="field-explanation" aria-live="polite"><span>{active.label.toUpperCase()}</span><h2>{active.value}</h2><p>{active.copy}</p></section><p className="education-small">Exact deductions depend on your pay and personal circumstances. Current tax, National Insurance, pension and student-finance rules can change.</p></div>}
