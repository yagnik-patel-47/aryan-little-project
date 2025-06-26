"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import { useLanguage } from '../LanguageProvider';

const TABLES = [
  { name: "routes", label: "Routes" },
  { name: "vendors", label: "Vendors" },
  { name: "items", label: "Items" },
  { name: "bills", label: "Bills" },
  { name: "bill_items", label: "Bill Items" },
];

type ImportResult = {
  success: boolean;
  count?: number;
  error?: any;
};

type FilesState = {
  [key: string]: File | undefined;
};

type ResultsState = {
  [key: string]: ImportResult;
};

export default function ImportPage() {
  const { language } = useLanguage();
  const [files, setFiles] = useState<FilesState>({});
  const [results, setResults] = useState<ResultsState>({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (table: string, file: File | undefined) => {
    setFiles((prev) => ({ ...prev, [table]: file }));
  };

  const handleImport = async () => {
    setLoading(true);
    let importResults: ResultsState = {};
    for (const { name } of TABLES) {
      const file = files[name];
      if (!file) continue;
      const text = await file.text();
      const { data, errors } = Papa.parse(text, { 
        header: true, 
        skipEmptyLines: true,
        delimiter: "," 
      });
      if (errors && errors.length > 0 && !(errors.length === 1 && errors[0].code === 'UndetectableDelimiter')) {
        importResults[name] = { success: false, error: errors };
        continue;
      }
      // Send to API
      try {
        const res = await fetch(`/api/${name}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Array.isArray(data) ? data : [data]),
        });
        if (!res.ok) throw new Error(await res.text());
        importResults[name] = { success: true, count: (data as any[]).length };
      } catch (e: any) {
        importResults[name] = { success: false, error: e.message };
      }
    }
    setResults(importResults);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h1>{language === 'gu' ? 'જથ્થાબંધ ડેટા આયાત કરો' : 'Bulk Import Data'}</h1>
      <p>{language === 'gu' ? 'દરેક ટેબલ માટે CSV ફાઇલો અપલોડ કરો. કૉલમ્સ તમારા સુપાબેસ સ્કીમા સાથે મેળ ખાતી હોવી જોઈએ.' : 'Upload CSV files for each table. Columns should match your Supabase schema.'}</p>
      
      <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '4px', margin: '16px 0' }}>
        <h4>{language === 'gu' ? 'વિક્રેતાઓ CSV માટે સૂચનાઓ' : 'Instructions for Vendors CSV'}</h4>
        <p>{language === 'gu' ? 'તમારી vendors.csv ફાઇલમાં નીચેની કૉલમ્સ હોવી આવશ્યક છે:' : 'Your vendors.csv file must have the following columns:'}</p>
        <ul>
          <li><strong>name</strong>: {language === 'gu' ? 'વિક્રેતાનું નામ.' : 'The name of the vendor.'}</li>
          <li><strong>route_name</strong>: {language === 'gu' ? 'રૂટનું ચોક્કસ નામ જે વિક્રેતા સાથે જોડાયેલ છે. તે તમારા ડેટાબેઝમાં હાલના રૂટ સાથે મેળ ખાવું આવશ્યક છે.' : 'The exact name of the route the vendor belongs to. This must match an existing route in your database.'}</li>
          <li><strong>contact</strong> (optional): {language === 'gu' ? 'વિક્રેતાનો સંપર્ક નંબર.' : "The vendor's contact number."}</li>
          <li><strong>address</strong> (optional): {language === 'gu' ? 'વિક્રેતાનું સરનામું.' : "The vendor's address."}</li>
        </ul>
        <p>{language === 'gu' ? 'ઉદાહરણ:' : 'Example:'}</p>
        <pre style={{ background: '#eee', padding: '8px', borderRadius: '4px' }}>
{`name,route_name,contact,address
"Shop A","Main Street Route","1234567890","123 Main St"
"Store B","Downtown Route",,"456 Center Ave"`}
        </pre>
      </div>

      <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '4px', margin: '16px 0' }}>
        <h4>{language === 'gu' ? 'રૂટ્સ CSV માટે સૂચનાઓ' : 'Instructions for Routes CSV'}</h4>
        <p>{language === 'gu' ? 'તમારી routes.csv ફાઇલમાં નીચેની કૉલમ હોવી આવશ્યક છે:' : 'Your routes.csv file must have the following column:'}</p>
        <ul>
          <li><strong>name</strong>: {language === 'gu' ? 'રૂટનું અનન્ય નામ.' : 'The unique name of the route.'}</li>
        </ul>
        <p>{language === 'gu' ? 'ઉદાહરણ:' : 'Example:'}</p>
        <pre style={{ background: '#eee', padding: '8px', borderRadius: '4px' }}>
{`name
"Main Street Route"
"Downtown Route"`}
        </pre>
      </div>

      <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '4px', margin: '16px 0' }}>
        <h4>{language === 'gu' ? 'વસ્તુઓ CSV માટે સૂચનાઓ' : 'Instructions for Items CSV'}</h4>
        <p>{language === 'gu' ? 'તમારી items.csv ફાઇલમાં નીચેની કૉલમ્સ હોવી આવશ્યક છે:' : 'Your items.csv file must have the following columns:'}</p>
        <ul>
          <li><strong>name_en</strong>: {language === 'gu' ? 'વસ્તુનું નામ અંગ્રેજીમાં.' : 'The name of the item in English.'}</li>
          <li><strong>name_gu</strong>: {language === 'gu' ? 'વસ્તુનું નામ ગુજરાતીમાં.' : 'The name of the item in Gujarati.'}</li>
          <li><strong>rate</strong>: {language === 'gu' ? 'વસ્તુનો ભાવ.' : 'The price of the item.'}</li>
          <li><strong>has_gst</strong>: {language === 'gu' ? 'GST છે કે નહીં (true/false).' : 'Whether the item has GST (true/false).'}</li>
          <li><strong>gst_percentage</strong> (optional): {language === 'gu' ? 'જો has_gst true હોય તો GST ટકાવારી.' : 'The GST percentage if has_gst is true.'}</li>
        </ul>
      </div>

      <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '4px', margin: '16px 0' }}>
        <h4>{language === 'gu' ? 'બિલ્સ CSV માટે સૂચનાઓ' : 'Instructions for Bills CSV'}</h4>
        <p>{language === 'gu' ? 'તમારી bills.csv ફાઇલમાં નીચેની કૉલમ્સ હોવી આવશ્યક છે:' : 'Your bills.csv file must have the following columns:'}</p>
        <ul>
            <li><strong>vendor_name</strong>: {language === 'gu' ? 'વિક્રેતાનું ચોક્કસ નામ. તે ડેટાબેઝમાં હાલના વિક્રેતા સાથે મેળ ખાવું આવશ્યક છે.' : 'The exact name of the vendor. This must match an existing vendor in the database.'}</li>
            <li><strong>date</strong>: {language === 'gu' ? 'બિલની તારીખ (YYYY-MM-DD).' : 'The date of the bill (YYYY-MM-DD).'}</li>
        </ul>
      </div>

      <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '4px', margin: '16px 0' }}>
        <h4>{language === 'gu' ? 'બિલ વસ્તુઓ CSV માટે સૂચનાઓ' : 'Instructions for Bill Items CSV'}</h4>
        <p>{language === 'gu' ? 'તમારી bill_items.csv ફાઇલમાં નીચેની કૉલમ્સ હોવી આવશ્યક છે:' : 'Your bill_items.csv file must have the following columns:'}</p>
        <ul>
            <li><strong>bill_id</strong>: {language === 'gu' ? 'બિલનું ID જેની આ વસ્તુ છે. આ ID બિલ્સ ટેબલમાંથી આવે છે.' : 'The ID of the bill this item belongs to. This comes from the bills table.'}</li>
            <li><strong>item_name_en</strong>: {language === 'gu' ? 'વસ્તુનું ચોક્કસ અંગ્રેજી નામ. તે ડેટાબેઝમાં હાલની વસ્તુ સાથે મેળ ખાવું આવશ્યક છે.' : 'The exact English name of the item. This must match an existing item in the database.'}</li>
            <li><strong>quantity</strong>: {language === 'gu' ? 'ખરીદેલી વસ્તુનો જથ્થો.' : 'The quantity of the item purchased.'}</li>
        </ul>
      </div>

      {TABLES.map(({ name, label }) => (
        <div key={name} style={{ marginBottom: 16 }}>
          <label>
            <b>{label} CSV:</b>
            <input type="file" accept=".csv" onChange={e => {
              const file = e.target.files && e.target.files[0] ? e.target.files[0] as File : undefined;
              handleFileChange(name, file);
            }} />
          </label>
        </div>
      ))}
      <button onClick={handleImport} disabled={loading} style={{ marginTop: 16, padding: "8px 24px" }}>
        {loading ? (language === 'gu' ? 'આયાત થઈ રહ્યું છે...' : 'Importing...') : (language === 'gu' ? 'બધું આયાત કરો' : 'Import All')}
      </button>
      <div style={{ marginTop: 32 }}>
        {Object.keys(results).length > 0 && <h3>{language === 'gu' ? 'પરિણામો:' : 'Results:'}</h3>}
        <ul>
          {Object.entries(results).map(([table, res]) => (
            <li key={table} style={{ color: res.success ? "green" : "red" }}>
              {table}: {res.success ? `${language === 'gu' ? 'આયાત થયેલ' : 'Imported'} ${res.count} ${language === 'gu' ? 'પંક્તિઓ' : 'rows'}` : `${language === 'gu' ? 'ભૂલ:' : 'Error:'} ${Array.isArray(res.error) ? res.error.map(e => e.message).join(', ') : JSON.stringify(res.error)}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 