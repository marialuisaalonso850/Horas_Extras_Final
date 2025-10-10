export const LoadSpinner = ({ styles, name }) => {
  let textName = '';
  
  (name) ? textName = name : textName = 'Cargando';

  return (
    <div className={`${styles} inset-0 flex flex-col items-center justify-center`}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-5 mb-4 border-epaColor"></div>
      <div className="text-epaColor text-xl font-semibold">{textName}</div>
    </div>
  );
};
