import { useState } from 'react';
import { RegisterCard } from '@/components/register/RegisterCard';
import { FormCargo } from '@/components/register/FormCargo';
import { FormFuncionario } from '@/components/register/FormFuncionario';
import { TableFuncionarios } from '@/components/register/TableFuncionarios';

export const Register = () => {
  const [selectedForm, setSelectedForm] = useState(null);

  const handleBack = () => setSelectedForm(null);

  const renderContent = () => {
    switch (selectedForm) {
      case 'cargo':
        return <FormCargo onBack={handleBack} />;

      case 'funcionario':
        return <FormFuncionario onBack={handleBack} />;

      case 'consultar':
        return <TableFuncionarios onBack={handleBack} />;

      default:
        return (
          <div className="grid grid-cols-2 gap-10 p-10">
            <RegisterCard
              title="Crear Cargo"
              onClick={() => setSelectedForm('cargo')}
            />
            <RegisterCard
              title="Registrar Funcionario"
              onClick={() => setSelectedForm('funcionario')}
            />
            <RegisterCard
              title="Consultar Funcionarios"
              onClick={() => setSelectedForm('consultar')}
            />
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
};
