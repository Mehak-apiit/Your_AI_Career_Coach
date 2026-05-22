const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;