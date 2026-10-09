// Point this to the GitHub/Vercel deployment after its calendar and auth are verified.
export const MOVE_URL = process.env.NEXT_PUBLIC_MOVE_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3001" : "https://elcalendario.lovable.app/");
