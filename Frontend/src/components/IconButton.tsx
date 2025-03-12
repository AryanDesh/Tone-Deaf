const IconButton = ({ clickFunction, src } : {
  clickFunction : () => void,
  src: string
}) => {
  return (
    <button className="min-w-8" onClick={clickFunction}><img src={src} /></button>
  )
}

export default IconButton