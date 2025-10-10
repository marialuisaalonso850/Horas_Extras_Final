import { useAuth } from "@/context/AuthContext"

export const HomePage = () => {
  
  const { user } = useAuth();

  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-white px-10 py-20 rounded-2xl">
        <h3 className="text-4xl text-epaColor font-bold text-center pb-2">Bienvenido {user.name}</h3>
        <p className="text-xl">En esta plataforma usted podrá determinar las horas extra de sus trabajadores</p>
      </div>      
    </div>
  )
}