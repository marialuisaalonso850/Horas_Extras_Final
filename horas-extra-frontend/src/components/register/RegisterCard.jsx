export const RegisterCard = ({ title, onClick }) => {
  return (
    <div className="bg-white border-1 border-epaColor text-center text-epaColor font-bold text-2xl py-20 rounded-2xl cursor-pointer" onClick={onClick}>
      <h3>{ title }</h3>
    </div>
  )
}