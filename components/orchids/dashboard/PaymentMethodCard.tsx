import { Info, Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function PaymentMethodCard() {
    const [paymentMethod, setPaymentMethod] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPaymentMethod() {
            try {
                const res = await fetch('/api/payment-method');
                if (res.ok) {
                    const data = await res.json();
                    setPaymentMethod(data.paymentMethod);
                }
            } catch (error) {
                console.error("Failed to fetch payment method", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPaymentMethod();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm min-h-[140px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    // Fallback if no data
    const data = paymentMethod || {
        cardHolder: "Rocks Company Ltd",
        accountNumber: "**** **** **** 6273",
        expiration: "12/28",
        cardType: "VISA",
        methodType: "Debit Card"
    };

    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-[15px] text-gray-900 dark:text-foreground">Payment Method</h3>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <button className="text-xs text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-accent transition-colors">
                    Change Payment Method
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <p className="text-[11px] text-gray-400 mb-1">Cardholder name</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{data.cardHolder}</p>
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 mb-1">Account Number</p>
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{data.accountNumber.replace(/(\d{4}) (\d{4}) (\d{4})/, "**** **** ****")}</p>
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 mb-1">Expiration</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{data.expiration}</p>
                </div>
                <div>
                    <p className="text-[11px] text-gray-400 mb-1">Payment Method</p>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px] text-indigo-900 dark:text-indigo-400 italic tracking-tight">{data.cardType}</span>
                        <span className="text-sm text-gray-900 dark:text-foreground">{data.methodType} · {data.cardType}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
