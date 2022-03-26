import React from 'react';
import { Navigate } from "react-router-dom";
import { getUser } from "../util/Util";

export const UnauthedRoute = ({ children }) => {
    const user = getUser();
    if (user) return <Navigate to='/' replace />;
    return children;
};