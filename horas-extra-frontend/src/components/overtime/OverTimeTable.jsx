export const OverTimeTable = ({ registros }) => {

  return registros.length === 0 ? (
    <div className="text-center text-xl text-gray-500 font-semibold py-8">
            No se encontraron reportes
    </div>
  ) : (
    <table className="table-auto border-collapse border border-gray-400 w-full text-center">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-400 px-2">Nombre Funcionario</th>
          <th className="border border-gray-400 px-2">HEDO</th>
          <th className="border border-gray-400 px-2">HENO</th>
          <th className="border border-gray-400 px-2">HEDF</th>
          <th className="border border-gray-400 px-2">HENF</th>
          <th className="border border-gray-400 px-2">HDF</th>
          <th className="border border-gray-400 px-2">HNF</th>
          <th className="border border-gray-400 px-2">RNO</th>
          <th className="border border-gray-400 px-2">Total Horas Extra</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((item, idx) => (
          <tr key={idx}>
            <td className="border border-gray-400 px-2">
              {item.nombre_Funcionario}
            </td>
            <td className="border border-gray-400 px-2">{item.HEDO_HORA}</td>
            <td className="border border-gray-400 px-2">{item.HENO_HORA}</td>
            <td className="border border-gray-400 px-2">{item.HEDF_HORA}</td>
            <td className="border border-gray-400 px-2">{item.HENF_HORA}</td>
            <td className="border border-gray-400 px-2">{item.HDF_HORA}</td>
            <td className="border border-gray-400 px-2">{item.HNF_HORA}</td>
            <td className="border border-gray-400 px-2">{item.RNO_HORA}</td>
            <td className="border border-gray-400 px-2 font-bold">
              {item.totalExtras_DEC}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}