import './Background.css'

const logoModules = import.meta.glob('../assets/logo/*', {
  eager: true,
  import: 'default',
})

const logos = Object.values(logoModules)

function BackgroundLogos() {
  if (!logos.length) {
    return null
  }

  return (
    <div className="background-logos" aria-hidden="true">
      {logos.map((logoSrc) => (
        <img
          key={logoSrc}
          src={logoSrc}
          alt="logo"
          className="main-logo-image"
        />
      ))}
    </div>
  )
}

export default BackgroundLogos
