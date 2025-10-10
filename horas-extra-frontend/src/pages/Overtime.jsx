import { useState } from "react"
import { RegisterOvertime } from "@/components/overtime/RegisterOvertime";
import { RegisterCard } from "@/components/register/RegisterCard";
import { GetOvertime } from "@/components/overtime/GetOvertime";

export const Overtime = () => {

  const [selectedForm, setSelectedForm] = useState(null);
  const handleBack = () => setSelectedForm(null);

  const renderContent = () => {
    switch (selectedForm) {
      case 'crearHoraExtra':
        return <RegisterOvertime onBack={handleBack} />
      case 'listarHorasExtra':
        return <GetOvertime onBack={handleBack} />
      default:
        return (
          <div className="grid grid-cols-2 gap-10 p-10 h-full items-center">
            <RegisterCard
              title="Crear Horas Extra"
              onClick={() => setSelectedForm('crearHoraExtra')}
            />
            <RegisterCard
              title="Listar Horas Extra"
              onClick={() => setSelectedForm('listarHorasExtra')}
            />
          </div>
        )
    }
  }

  return (
    <>
      {renderContent()}
    </>
  )
}