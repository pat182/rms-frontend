
import { LoaderCircle } from "lucide-react";

type LoadingPageProps = {
    message?: string;
};

const LoadingPage = ({
    message = "Loading, please wait...",
}: LoadingPageProps) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-5">
                <img
                    src="/rms-logo.png"
                    alt="Restaurant Management System"
                    className="h-16 w-auto object-contain"
                />

                <LoaderCircle
                    size={32}
                    className="animate-spin text-[#6495ED]"
                />

                <div className="text-center">
                    <p className="mt-1 text-sm text-slate-500">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;
