import { useNavigate } from 'react-router-dom'

export default function Restaurant(){
    // const navigate = useNavigate()
    return (
        <main className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-600">
                        Restaurants
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your Restaurants.
                    </p>
                </div>

                <button
                    type="button"
                    // onClick={ () => {navigate('/menu/create')} }
                    className="cursor-pointer rounded-lg bg-[#6495ED] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                    + Add Restaurants
                </button>
            </div>
        </main>
    );
}