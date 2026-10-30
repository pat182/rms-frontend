import { LoaderCircle } from "lucide-react";

export function TableLoader() {
    return (
        <div className="flex justify-center">
            <LoaderCircle size={20} className="animate-spin text-[#6495ED]"/>
        </div>
    );
}
// export function Test() {
//     return (
//         <div className="flex justify-center">
//             <h1>Test Loader</h1>
//         </div>
//     );
// }