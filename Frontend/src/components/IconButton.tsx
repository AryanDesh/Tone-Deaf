const IconButton = ({ clickFunction, src } : {
  clickFunction : () => void,
  src: string
}) => {
  return (
    <button onClick={clickFunction}><img src={src} /></button>
  )
}

export default IconButton