import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Info,
  Coins,
} from 'lucide-react';
import { previewCsv, confirmCsvImport } from '../services/api';
import type { CSVPreviewResponse, ExpenseCreate, ViewType, CurrencyCode } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrencyInfo } from '../utils/currency';

interface CsvImportViewProps {
  onImportSuccess: () => void;
  onNavigate: (view: ViewType) => void;
}

export const CsvImportView: React.FC<CsvImportViewProps> = ({ onImportSuccess, onNavigate }) => {
  const { format, currency, currencyInfo, availableCurrencies } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statementCurrency, setStatementCurrency] = useState<CurrencyCode>(currency);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<CSVPreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync statement currency with active currency on mount
  useEffect(() => {
    setStatementCurrency(currency);
  }, [currency]);

  // Sample CSV generator for testing
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'Title,Amount,Category,Date,Payment Method,Notes\n' +
      "Campus Bookstore Calculus Guide,54.20,Books & Academics,2026-11-04,Student Debit Card,Midterm prep\n" +
      "Campus Deli Panini,8.50,Dining & Groceries,2026-11-05,Campus Meal Plan,Lunch with classmate\n" +
      "Target Dorm Laundry Pods,16.75,Housing & Utilities,2026-11-06,UPI / Card,Monthly supplies\n" +
      "Espresso Lab Double Shot,4.50,Coffee & Snacks,2026-11-07,Campus Card,Study hall fuel\n" +
      "City Commuter Bus Pass,25.00,Transit & Commute,2026-11-08,Debit Card,Monthly student subsidy\n" +
      "Audible Student Audiobooks,7.99,Subscriptions & Tech,2026-11-09,Credit Card,Campus commute audio\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spendwise_sample_${statementCurrency.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatementCurrencyChange = async (newCur: CurrencyCode) => {
    setStatementCurrency(newCur);
    if (selectedFile) {
      setIsLoadingPreview(true);
      setError(null);
      try {
        const result = await previewCsv(selectedFile, newCur);
        setPreviewData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to re-parse CSV with selected currency');
      } finally {
        setIsLoadingPreview(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid .csv spreadsheet file.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccessMessage(null);
    setIsLoadingPreview(true);

    try {
      const result = await previewCsv(file, statementCurrency);
      setPreviewData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || previewData.preview_rows.length === 0) return;

    setIsImporting(true);
    setError(null);

    const expensesToImport: ExpenseCreate[] = previewData.preview_rows.map((row) => ({
      title: row.title,
      amount: row.amount, // base USD converted by backend
      original_amount: row.original_amount != null ? row.original_amount : row.amount,
      original_currency: row.original_currency || statementCurrency,
      category: row.category,
      date: row.date,
      payment_method: row.payment_method,
      notes: row.notes,
      is_recurring: false,
    }));

    try {
      const res = await confirmCsvImport(expensesToImport);
      setSuccessMessage(res.message);
      setPreviewData(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onImportSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Upload Dropzone & Instructions Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload CSV Statements</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bulk import student expenses from campus accounts, mobile apps, or spreadsheets. Active display currency: {currencyInfo.name} ({currencyInfo.symbol} {currencyInfo.code}).
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('expenses')}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              View Expenses &rarr;
            </button>
          </div>
        )}

        {/* Statement Currency Selector Card */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Statement File Currency</h3>
              <p className="text-[11px] text-slate-500">
                Specify the currency used for amounts in your CSV file before importing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statementCurrency}
              onChange={(e) => handleStatementCurrencyChange(e.target.value as CurrencyCode)}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer shadow-2xs"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dropzone Container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-emerald-50/20 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Click to select or drag and drop your CSV file'}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Supported columns: Title (or Description), Amount, Category, Date, Payment Method, Notes
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-emerald-300">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select CSV File</span>
          </span>
        </div>

        {/* Information Callout */}
        <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Pandas Validation & Storage:</strong> Each row is strictly validated on the backend. Transactions are preserved in standard base currency and automatically converted into your preferred currency across dashboards, charts, and ledgers.
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingPreview && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Validating CSV rows with Pandas engine...</p>
        </div>
      )}

      {/* CSV Preview Section */}
      {previewData && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Header Summary & Confirmation Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Validation Results</h3>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="text-slate-500">
                  Total Rows: <strong>{previewData.total_rows}</strong>
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {previewData.valid_count} Valid
                </span>
                {previewData.invalid_count > 0 && (
                  <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {previewData.invalid_count} Invalid
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || previewData.valid_count === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Import {previewData.valid_count} Expenses</span>
                </>
              )}
            </button>
          </div>

          {/* Valid Rows Preview Table */}
          {previewData.valid_count > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Valid Records Ready for Import
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Statement: <strong className="text-slate-800">{previewData.currency || statementCurrency}</strong></span>
                  <span>•</span>
                  <span>Active Display: <strong className="text-emerald-700">{currencyInfo.code}</strong></span>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-4">Title</th>
                      <th className="py-2.5 px-3">Statement Amount</th>
                      <th className="py-2.5 px-3">Converted ({currencyInfo.code})</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.preview_rows.map((row) => {
                      const rowCur = (row.original_currency || previewData.currency || statementCurrency) as CurrencyCode;
                      const curInfo = getCurrencyInfo(rowCur);
                      const origVal = row.original_amount != null ? row.original_amount : row.amount;
                      return (
                        <tr key={row.row_number} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-slate-400 font-medium">{row.row_number}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{row.title}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">
                            {curInfo.symbol} {origVal.toFixed(curInfo.decimals)} <span className="text-[10px] text-slate-400">{curInfo.code}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {format(row.amount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {row.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{row.date}</td>
                          <td className="py-2.5 px-3 text-slate-500">{row.payment_method}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invalid Rows Warning Table */}
          {previewData.invalid_count > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Invalid Records (Will be skipped during import)</span>
              </h4>
              <div className="border border-rose-200 rounded-2xl overflow-hidden overflow-x-auto bg-rose-50/30">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-100/60 text-rose-900 font-bold border-b border-rose-200">
                    <tr>
                      <th className="py-2.5 px-3">Row</th>
                      <th className="py-2.5 px-4">Title</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-4">Validation Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {previewData.invalid_rows.map((row) => (
                      <tr key={row.row_number} className="text-rose-900">
                        <td className="py-2.5 px-3 font-bold">{row.row_number}</td>
                        <td className="py-2.5 px-4 font-medium">{row.title || '<empty>'}</td>
                        <td className="py-2.5 px-3">{row.amount !== null && !isNaN(Number(row.amount)) ? format(Number(row.amount)) : String(row.amount)}</td>
                        <td className="py-2.5 px-4 text-rose-700 font-semibold">{row.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
