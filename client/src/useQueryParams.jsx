/** @format */

import { useSearchParams } from "react-router-dom";

export default function useQueryParams() {
    const [params] = useSearchParams();
    return Object.fromEntries([...params]);
 }