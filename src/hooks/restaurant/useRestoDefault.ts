import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {getRestaurants} from "../../api/restaurant.ts"
import { type Restuarant } from '../../types/restaurant.ts';

export default function useRestoDefault(){
    const navigate = useNavigate()
    const [loading,setLoading] = useState(true)
    const [restaurants,setRestaurants] = useState<Restuarant[]>([])
    const [error,setError] = useState('')

    useEffect(()=>{
        let cancelled = false;
        async function fetchRestaurants(){
            try{ 
                setLoading(true);
                // await new Promise(resolve => setTimeout(resolve, 5000))
                const response = await getRestaurants({ sort_by: 'created_at', sort_order: 'asc' })
                if (!response.ok) {
                    throw new Error('Failed to fetch restaurants');
                }
                const result = await response.json()
                if (!cancelled) {
                    setRestaurants(result.data ?? []);
                }
               
            }catch (error: any){
                if (!cancelled) {
                    setError(error ? error.message : "Something went wrong")
                }
            }finally{
                if (!cancelled) {
                    setLoading(false);
                }
            }

        }

        fetchRestaurants()
    },[])
    
    return { 
        navigate,
        loading,
        restaurants,
        error
    };
}