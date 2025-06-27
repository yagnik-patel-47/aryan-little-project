"use client";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from '../LanguageProvider';

// Interfaces
interface BillItem {
    id: string;
    item_id: string;
    quantity: number;
    price?: number;
}
interface Bill {
    id: string;
    vendor_id: string;
    date: string | number | Date;
    items: BillItem[];
}
interface Vendor {
    id: string;
    name: string;
    address?: string;
    contact?: string;
}
interface Item {
    id: string;
    name_en: string;
    name_gu: string;
    rate: number;
    gst_percentage?: number;
}

// Business Header
const businessDetails = {
    name: "JAISWAL SALES",
    address: "APMC MARKET ,NEAR BUS STOP,AT PO. TEJGADH, TA. DIST. CHHOTAUDEPUR",
    address2: "Bank: State Bank Of India Tejgadh, A/C No: 36107439043, IFSC: SBIN0003845",
    gstin: "GSTN NO: 24AAMFJ3444PIZW | PAN: AAMFJ3444P",
    contact: "Mo. 8401772172"
};

const businessDetailsGu = {
    name: "જયસ્વાલ સેલ્સ",
    address: "ખેડૂત પેટ્રોલ પંપની પાસે, હાઇવે રોડ, મોડાસા-૩૮૩૩૧૫",
    address2: "જી. અરવલ્લી",
    gstin: "જીએસટીએન: 24CVZPS7118B1Z4",
    contact: "મો. ૯૯૨૪૫૮૭૩૫૩"
};

function formatDate(dateNum: string | number | Date) {
    const d = new Date(dateNum);
    return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
}

export function SummaryPageClient({ initialBills, initialItems, initialVendors }: { initialBills: Bill[], initialItems: Item[], initialVendors: Vendor[] }) {
    const [bills, setBills] = useState<Bill[]>(initialBills);
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();

    const itemMap = useMemo(() => Object.fromEntries(initialItems.map(item => [item.id, item])), [initialItems]);
    const vendorMap = useMemo(() => Object.fromEntries(initialVendors.map(vendor => [vendor.id, vendor])), [initialVendors]);

    const fetchBills = async () => {
      setLoading(true);
      const res = await fetch("/api/bills");
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    async function handleDeleteBill(billId: string) {
        if (!window.confirm(language === 'gu' ? 'શું તમે ખરેખર આ બિલ કાઢી નાખવા માંગો છો?' : 'Are you sure you want to delete this bill?')) return;
        setLoading(true);
        const response = await fetch(`/api/bills?id=${billId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setBills(bills.filter(b => b.id !== billId));
        } else {
            const err = await response.json();
            alert(`Failed to delete bill: ${err.error}`);
        }
        setLoading(false);
    }

    async function handleDeleteBillItem(billItemId: string) {
        if (!window.confirm(language === 'gu' ? 'શું તમે ખરેખર આ બિલ આઇટમ કાઢી નાખવા માંગો છો?' : 'Are you sure you want to delete this bill item?')) return;
        setLoading(true);
        const response = await fetch(`/api/bill_items?id=${billItemId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            // Refetch all bills to get the updated state
            fetchBills(); 
        } else {
            const err = await response.json();
            alert(`Failed to delete bill item: ${err.error}`);
        }
        setLoading(false);
    }

    async function handleDeleteAllBills() {
        if (!window.confirm(language === 'gu' ? 'શું તમે ખરેખર બધા બિલ્સ કાઢી નાખવા માંગો છો? આ ક્રિયાને પૂર્વવત્ કરી શકાતી નથી.' : 'Are you sure you want to delete ALL bills? This cannot be undone.')) return;
        setLoading(true);
        const response = await fetch('/api/bills', { method: 'DELETE' });

        if (response.ok) {
            setBills([]);
        } else {
            alert("Failed to delete all bills.");
        }
        setLoading(false);
    }

    function downloadBillPDF(bill: Bill, lang: 'en' | 'gu') {
        const doc = new jsPDF();
        const vendor = vendorMap[bill.vendor_id];
        const billItems = bill.items || [];
        const business = lang === 'gu' ? businessDetailsGu : businessDetails;

        doc.setFontSize(16);
        doc.text(business.name, 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(business.address, 105, 22, { align: 'center' });
        doc.text(business.address2, 105, 27, { align: 'center' });
        doc.text(business.gstin, 105, 32, { align: 'center' });
        doc.text(business.contact, 105, 37, { align: 'center' });
        
        doc.line(10, 45, 200, 45);

        doc.setFontSize(12);
        doc.text(`${lang === 'gu' ? 'વેન્ડરનું નામ' : 'Vendor Name'}: ${vendor?.name || ''}`, 10, 55);
        doc.text(`${lang === 'gu' ? 'સરનામું' : 'Address'}: ${vendor?.address || ''}`, 10, 62);
        doc.text(`${lang === 'gu' ? 'સંપર્ક' : 'Contact'}: ${vendor?.contact || ''}`, 10, 69);
        doc.text(`${lang === 'gu' ? 'બિલની તારીખ' : 'Bill Date'}: ${formatDate(bill.date)}`, 150, 55);
        
        const tableData = billItems.map((item: BillItem) => {
            const itemDetails = itemMap[item.item_id];
            return [
                itemDetails ? (lang === 'gu' ? itemDetails.name_gu : itemDetails.name_en) : 'N/A',
                item.quantity,
                item.price?.toFixed(2) ?? '0.00'
            ];
        });

        let total = billItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

        autoTable(doc, {
            startY: 75,
            head: [[lang === 'gu' ? 'વસ્તુ' : 'Item', lang === 'gu' ? 'જથ્થો' : 'Quantity', lang === 'gu' ? 'ભાવ' : 'Price']],
            body: tableData,
            foot: [
                [{ content: lang === 'gu' ? 'કુલ' : 'Total', colSpan: 2, styles: { halign: 'right' } }, total.toFixed(2)]
            ],
            theme: 'striped'
        });

        doc.save(`bill_${vendor?.name}_${formatDate(bill.date)}_${lang}.pdf`);
    }

    function drawBillOnPage(doc: jsPDF, bill: Bill, lang: 'en' | 'gu') {
        const vendor = vendorMap[bill.vendor_id];
        const billItems = bill.items || [];
        const business = lang === 'gu' ? businessDetailsGu : businessDetails;

        doc.setFontSize(16);
        doc.text(business.name, 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(business.address, 105, 22, { align: 'center' });
        doc.text(business.address2, 105, 27, { align: 'center' });
        doc.text(business.gstin, 105, 32, { align: 'center' });
        doc.text(business.contact, 105, 37, { align: 'center' });
        
        doc.line(10, 45, 200, 45);

        doc.setFontSize(12);
        doc.text(`${lang === 'gu' ? 'વેન્ડરનું નામ' : 'Vendor Name'}: ${vendor?.name || ''}`, 10, 55);
        doc.text(`${lang === 'gu' ? 'સરનામું' : 'Address'}: ${vendor?.address || ''}`, 10, 62);
        doc.text(`${lang === 'gu' ? 'સંપર્ક' : 'Contact'}: ${vendor?.contact || ''}`, 10, 69);
        doc.text(`${lang === 'gu' ? 'બિલની તારીખ' : 'Bill Date'}: ${formatDate(bill.date)}`, 150, 55);
        
        const head = [[
            lang === 'gu' ? 'વસ્તુ' : 'Item',
            lang === 'gu' ? 'જથ્થો' : 'Quantity',
            lang === 'gu' ? 'ભાવ' : 'Rate',
            lang === 'gu' ? 'GST %' : 'GST %',
            lang === 'gu' ? 'GST રકમ' : 'GST Amount',
            lang === 'gu' ? 'GST વગર' : 'Without GST',
            lang === 'gu' ? 'GST સાથે' : 'With GST',
        ]];
        const tableData = billItems.map((item: BillItem) => {
            const itemDetails = itemMap[item.item_id];
            const rate = item.price || 0;
            const qty = item.quantity;
            const gstRate = itemDetails?.gst_percentage || 0;
            const withoutGst = rate * qty;
            const gstAmount = withoutGst * (gstRate / 100);
            const withGst = withoutGst + gstAmount;
            return [
                itemDetails ? (lang === 'gu' ? itemDetails.name_gu : itemDetails.name_en) : 'N/A',
                qty,
                rate.toFixed(2),
                gstRate + '%',
                gstAmount.toFixed(2),
                withoutGst.toFixed(2),
                withGst.toFixed(2),
            ];
        });
        const totalGst = billItems.reduce((sum, item) => {
            const itemDetails = itemMap[item.item_id];
            const rate = item.price || 0;
            const qty = item.quantity;
            const gstRate = itemDetails?.gst_percentage || 0;
            return sum + (rate * qty) * (gstRate / 100);
        }, 0);
        const totalWithoutGst = billItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        const totalWithGst = billItems.reduce((sum, item) => {
            const itemDetails = itemMap[item.item_id];
            const rate = item.price || 0;
            const qty = item.quantity;
            const gstRate = itemDetails?.gst_percentage || 0;
            return sum + (rate * qty) * (1 + gstRate / 100);
        }, 0);
        autoTable(doc, {
            startY: 75,
            head,
            body: tableData,
            foot: [
                [
                    { content: lang === 'gu' ? 'કુલ' : 'Total', colSpan: 4, styles: { halign: 'right' } },
                    totalGst.toFixed(2),
                    totalWithoutGst.toFixed(2),
                    totalWithGst.toFixed(2),
                    ''
                ]
            ],
            theme: 'striped'
        });
    }

    const allBillItems = useMemo(() => bills.flatMap(b => b.items || []), [bills]);
    const total = useMemo(() => allBillItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0), [allBillItems]);
    
    const itemWiseSummary = useMemo(() => {
        let summary: Record<string, { qty: number; price: number, name: string }> = {};
        allBillItems.forEach((item: BillItem) => {
            const itemDetails = itemMap[item.item_id];
            if (!itemDetails) return;
            const name = language === 'gu' ? itemDetails.name_gu : itemDetails.name_en;
            if (!summary[name]) summary[name] = { qty: 0, price: 0, name };
            summary[name].qty += item.quantity;
            summary[name].price += (item.price || 0) * item.quantity;
        });
        return Object.values(summary);
    }, [allBillItems, itemMap, language]);

    function downloadSummaryPDF(lang: 'en' | 'gu') {
        const doc = new jsPDF();
        const business = lang === 'gu' ? businessDetailsGu : businessDetails;

        // --- Summary Page ---
        doc.setFontSize(16);
        doc.text(business.name, 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(business.address, 105, 22, { align: 'center' });
        doc.text(business.address2, 105, 27, { align: 'center' });
        doc.text(business.gstin, 105, 32, { align: 'center' });
        doc.text(business.contact, 105, 37, { align: 'center' });
        doc.line(10, 45, 200, 45);

        doc.setFontSize(14);
        doc.text(lang === 'gu' ? 'એકંદરે સારાંશ' : 'Overall Summary', 10, 55);
        doc.setFontSize(12);
        // Table header
        const head = [[
            lang === 'gu' ? 'વસ્તુ' : 'Item',
            lang === 'gu' ? 'કુલ જથ્થો' : 'Total Quantity',
            lang === 'gu' ? 'ભાવ' : 'Rate',
            lang === 'gu' ? 'GST %' : 'GST %',
            lang === 'gu' ? 'GST રકમ' : 'GST Amount',
            lang === 'gu' ? 'GST વગર' : 'Without GST',
            lang === 'gu' ? 'GST સાથે' : 'With GST',
        ]];
        // Table body
        const tableData = itemWiseSummary.map((item) => {
            const itemDetails = initialItems.find(i => (lang === 'gu' ? i.name_gu : i.name_en) === item.name);
            const rate = itemDetails?.rate || 0;
            const gstRate = itemDetails?.gst_percentage || 0;
            const withoutGst = rate * item.qty;
            const gstAmount = withoutGst * (gstRate / 100);
            const withGst = withoutGst + gstAmount;
            return [
                item.name,
                item.qty,
                rate.toFixed(2),
                gstRate + '%',
                gstAmount.toFixed(2),
                withoutGst.toFixed(2),
                withGst.toFixed(2),
            ];
        });
        // Table foot (totals)
        const totalGst = itemWiseSummary.reduce((sum, item) => {
            const itemDetails = initialItems.find(i => (lang === 'gu' ? i.name_gu : i.name_en) === item.name);
            const rate = itemDetails?.rate || 0;
            const gstRate = itemDetails?.gst_percentage || 0;
            return sum + (rate * item.qty) * (gstRate / 100);
        }, 0);
        const totalWithoutGst = itemWiseSummary.reduce((sum, item) => {
            const itemDetails = initialItems.find(i => (lang === 'gu' ? i.name_gu : i.name_en) === item.name);
            const rate = itemDetails?.rate || 0;
            return sum + (rate * item.qty);
        }, 0);
        const totalWithGst = itemWiseSummary.reduce((sum, item) => {
            const itemDetails = initialItems.find(i => (lang === 'gu' ? i.name_gu : i.name_en) === item.name);
            const rate = itemDetails?.rate || 0;
            const gstRate = itemDetails?.gst_percentage || 0;
            return sum + (rate * item.qty) * (1 + gstRate / 100);
        }, 0);
        const foot = [[
            { content: lang === 'gu' ? 'કુલ' : 'Total', colSpan: 4, styles: { halign: 'right' } },
            totalGst.toFixed(2),
            totalWithoutGst.toFixed(2),
            totalWithGst.toFixed(2),
            ''
        ]];
        autoTable(doc, {
            startY: 62,
            head,
            body: tableData,
            foot: [
                [
                    { content: lang === 'gu' ? 'કુલ' : 'Total', colSpan: 4, styles: { halign: 'right' } },
                    totalGst.toFixed(2),
                    totalWithoutGst.toFixed(2),
                    totalWithGst.toFixed(2),
                    ''
                ]
            ],
            theme: 'striped'
        });

        // --- Individual Bills ---
        bills.forEach(bill => {
            doc.addPage();
            drawBillOnPage(doc, bill, lang);
        });

        doc.save(`summary_${lang}.pdf`);
    }

    return (
        <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 16 }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>{language === 'gu' ? 'બિલ સારાંશ' : 'Bill Summary'}</h1>
            {loading && <p>{language === 'gu' ? 'લોડ કરી રહ્યું છે...' : 'Loading...'}</p>}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
                <button onClick={() => { if (language === 'en' || language === 'gu') { downloadSummaryPDF(language) }}} disabled={bills.length === 0} style={{ backgroundColor: 'darkgreen' }}>
                    {language === 'gu' ? 'સારાંશ PDF ડાઉનલોડ કરો' : 'Download Summary PDF'}
                </button>
                <button onClick={handleDeleteAllBills} disabled={loading || bills.length === 0} style={{ backgroundColor: 'darkred' }}>
                    {language === 'gu' ? 'બધા બિલ કાઢી નાખો' : 'Delete All Bills'}
                </button>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
                <h2>{language === 'gu' ? 'એકંદરે સારાંશ' : 'Overall Summary'}</h2>
                <p>{language === 'gu' ? 'કુલ રકમ' : 'Total Amount'}: {total.toFixed(2)}</p>
                <h3>{language === 'gu' ? 'વસ્તુ મુજબ સારાંશ' : 'Item-wise Summary'}</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            minWidth: 900,
                            borderCollapse: 'collapse',
                            tableLayout: 'auto',
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ minWidth: 100, padding: 8 }}>{language === 'gu' ? 'વસ્તુ' : 'Item'}</th>
                                <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'જથ્થો' : 'Quantity'}</th>
                                <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'ભાવ' : 'Rate'}</th>
                                <th style={{ minWidth: 70, padding: 8 }}>{language === 'gu' ? 'GST %' : 'GST %'}</th>
                                <th style={{ minWidth: 100, padding: 8 }}>{language === 'gu' ? 'GST રકમ' : 'GST Amount'}</th>
                                <th style={{ minWidth: 120, padding: 8 }}>{language === 'gu' ? 'GST વગર' : 'Without GST'}</th>
                                <th style={{ minWidth: 120, padding: 8 }}>{language === 'gu' ? 'GST સાથે' : 'With GST'}</th>
                                <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'ક્રિયા' : 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemWiseSummary.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.name}</td>
                                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.qty}</td>
                                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                {bills.map(bill => {
                    const vendor = vendorMap[bill.vendor_id];
                    const billTotal = (bill.items || []).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
                    const business = language === 'gu' ? businessDetailsGu : businessDetails;
                    
                    return (
                        <div key={bill.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ marginTop: 0 }}>{language === 'gu' ? 'વેન્ડર' : 'Vendor'}: {vendorMap[bill.vendor_id]?.name || 'N/A'}</h3>
                                    <p>{language === 'gu' ? 'તારીખ' : 'Date'}: {formatDate(bill.date)}</p>
                                </div>
                                <div>
                                    <button onClick={() => downloadBillPDF(bill, 'en')} style={{ marginRight: '0.5rem' }}>Download (EN)</button>
                                    <button onClick={() => downloadBillPDF(bill, 'gu')} style={{ marginRight: '0.5rem' }}>Download (GU)</button>
                                    <button onClick={() => handleDeleteBill(bill.id)} style={{ backgroundColor: '#ff4d4d', color: 'white' }}>
                                        {language === 'gu' ? 'બિલ કાઢી નાખો' : 'Delete Bill'}
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{
                                        width: '100%',
                                        minWidth: 900,
                                        borderCollapse: 'collapse',
                                        tableLayout: 'auto',
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: 100, padding: 8 }}>{language === 'gu' ? 'વસ્તુ' : 'Item'}</th>
                                            <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'જથ્થો' : 'Quantity'}</th>
                                            <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'ભાવ' : 'Rate'}</th>
                                            <th style={{ minWidth: 70, padding: 8 }}>{language === 'gu' ? 'GST %' : 'GST %'}</th>
                                            <th style={{ minWidth: 100, padding: 8 }}>{language === 'gu' ? 'GST રકમ' : 'GST Amount'}</th>
                                            <th style={{ minWidth: 120, padding: 8 }}>{language === 'gu' ? 'GST વગર' : 'Without GST'}</th>
                                            <th style={{ minWidth: 120, padding: 8 }}>{language === 'gu' ? 'GST સાથે' : 'With GST'}</th>
                                            <th style={{ minWidth: 80, padding: 8 }}>{language === 'gu' ? 'ક્રિયા' : 'Action'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(bill.items || []).map((item) => {
                                            const itemDetails = itemMap[item.item_id];
                                            const rate = item.price || 0;
                                            const qty = item.quantity;
                                            const gstRate = itemDetails?.gst_percentage || 0;
                                            const withoutGst = rate * qty;
                                            const gstAmount = withoutGst * (gstRate / 100);
                                            const withGst = withoutGst + gstAmount;
                                            return (
                                                <tr key={item.id}>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{itemDetails ? (language === 'gu' ? itemDetails.name_gu : itemDetails.name_en) : 'N/A'}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{qty}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rate.toFixed(2)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{gstRate}%</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{gstAmount.toFixed(2)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{withoutGst.toFixed(2)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{withGst.toFixed(2)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                                        <button onClick={() => handleDeleteBillItem(item.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                            &#x1F5D1;
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={4}><b>{language === 'gu' ? 'કુલ' : 'Total'}</b></td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(bill.items || []).reduce((sum, item) => {
                                                const itemDetails = itemMap[item.item_id];
                                                const rate = item.price || 0;
                                                const qty = item.quantity;
                                                const gstRate = itemDetails?.gst_percentage || 0;
                                                return sum + (rate * qty) * (gstRate / 100);
                                            }, 0).toFixed(2)}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(bill.items || []).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(bill.items || []).reduce((sum, item) => {
                                                const itemDetails = itemMap[item.item_id];
                                                const rate = item.price || 0;
                                                const qty = item.quantity;
                                                const gstRate = itemDetails?.gst_percentage || 0;
                                                return sum + (rate * qty) * (1 + gstRate / 100);
                                            }, 0).toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 