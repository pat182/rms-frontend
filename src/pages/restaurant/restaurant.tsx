// import { useNavigate } from 'react-router-dom'
import useRestoDefault from "../../hooks/restaurant/useRestoDefault.ts"
import { AlertCircle, Store } from "lucide-react"; 


export default function Restaurant(){
    const {
        navigate,
        loading,
        error,
        restaurants
    } = useRestoDefault();
    console.log(restaurants)
    return (
        <main className="p-6">
            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Restaurants
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                        Manage your restaurants and keep your business information organized.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={ () => {navigate('/menu/create')} }
                    className="cursor-pointer self-start rounded-xl bg-[#6495ED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md sm:self-auto"
                >
                    + Add Restaurants
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {
                    loading ? (
                        Array.from({ length: 4 }, (_, index) => (
                            <div
                                key={index}
                                aria-hidden="true"
                                className="relative flex min-h-64 animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-100 via-blue-200 to-cyan-100" />
                                <div className="absolute right-4 top-5 h-5 w-14 rounded-full bg-slate-100" />

                                <div className="mb-4 flex justify-center pt-2">
                                    <div className="h-13 w-13 rounded-2xl bg-blue-50" />
                                </div>

                                <div className="mx-auto mb-5 h-5 w-2/3 rounded-full bg-slate-100" />

                                <div className="mt-auto space-y-4 border-t border-slate-100 pt-4">
                                    <div className="flex justify-between gap-4">
                                        <div className="h-3 w-14 rounded-full bg-slate-100" />
                                        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <div className="h-3 w-12 rounded-full bg-slate-100" />
                                        <div className="h-3 w-2/5 rounded-full bg-slate-100" />
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <div className="h-3 w-20 rounded-full bg-slate-100" />
                                        <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : error ? (
                        <div
                            role="alert"
                            className="col-span-full flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 shadow-sm"
                        >
                            <div className="rounded-xl bg-white p-2 text-rose-600 shadow-sm">
                                <AlertCircle aria-hidden="true" className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">{error}</h2>
                                <p className="mt-1 text-sm text-rose-700">{error}</p>
                            </div>
                        </div>
                    ) : (
                        restaurants.map((resto) => (
                            <div key={resto.id} className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6495ED] via-blue-[#6495ED]  to-cyan-300" />
                                <span
                                    className={`absolute right-4 top-5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        resto.is_active ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                    }`}
                                >
                                    {resto.is_active ? "Active" : "Inactive"}
                                </span>

                                <div className="mb-4 flex justify-center pt-2">
                                    <div className="rounded-2xl bg-blue-50 p-3 transition duration-200 group-hover:scale-105 group-hover:bg-blue-100">
                                        <Store className="h-7 w-7 text-[#6495ED]" />
                                    </div>
                                </div>

                                <h2 className="mb-4 text-center text-lg font-semibold tracking-tight text-slate-600">
                                    {resto.restaurant_name}
                                </h2>

                                <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="shrink-0 text-slate-400">Address</span>
                                        <span className="text-right font-medium text-slate-600">{resto.address}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="shrink-0 text-slate-400">Email</span>
                                        <span className="break-all text-right font-medium text-slate-600">{resto.email}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="shrink-0 text-slate-400">Contact Number</span>
                                        <span className="text-right font-medium text-slate-600">{resto.country.phone_code}{resto.contact_number}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                        
                        
                    )
                }
            
            </div>
        </main>
    );
}