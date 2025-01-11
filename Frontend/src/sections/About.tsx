import { Side} from "../components"

const About = () => {
  return (
      <Side position={[0, 0, -2]} rotation={[0, Math.PI, 0]} color="red">
        <h2 className="text-xl font-bold">About us</h2>
      </Side>
  )
}

export default About