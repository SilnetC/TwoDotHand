const Footer = () => {
  const footerColumns = [
    {
      title: 'Rólunk',
      links: [
        { name: 'Vélemények', href: '#' },
        { name: 'Gyakori kérdések', href: '#' }
      ]
    },
    {
      title: 'Támogatás',
      links: [
        { name: 'Ügyfélszolgálat', href: '#' },
        { name: 'Szállítás', href: '#' }
      ]
    },
    {
      title: 'Adatvédelem',
      links: [
        { name: 'ÁSZF', href: '#' },
        { name: 'Adatvédelmi nyilatkozat', href: '#' }
      ]
    },
    {
      title: 'Kapcsolat',
      links: [
        { 
          name: 'Threads', 
          href: '#',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.882 16.099c-.721 1.442-2.316 2.435-4.053 2.435-1.557 0-2.942-.837-3.688-2.179-.747-1.341-.747-2.935 0-4.276.746-1.342 2.131-2.179 3.688-2.179 1.737 0 3.332.993 4.053 2.435h2.813c-1.082-2.464-3.67-4.17-6.866-4.17-4.052 0-7.333 3.28-7.333 7.333s3.281 7.333 7.333 7.333c3.196 0 5.784-1.706 6.866-4.17h-2.813zm-9.787-3.921c-.36.647-.36 1.412 0 2.059.36.647 1.03 1.05 1.718 1.05.688 0 1.359-.403 1.718-1.05.36-.647.36-1.412 0-2.059-.359-.647-1.03-1.05-1.718-1.05-.688 0-1.358.403-1.718 1.05z"/>
            </svg>
          )
        },
        { 
          name: 'Youtube', 
          href: '#',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )
        }
      ]
    }
  ]

  return (
    <footer className="bg-blue-200 rounded-t-2xl mt-12 w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerColumns.map((column, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-lg text-center font-semibold text-blue-900 mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2 flex flex-col items-center">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-blue-800 hover:text-blue-900 hover:underline flex items-center gap-2 transition-colors"
                    >
                      {link.icon && (
                        <span className="shrink-0">
                          {link.icon}
                        </span>
                      )}
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer

