const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-4 px-6 mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-center text-center">
        <p className="text-sm mb-2">
          <span className="text-primaryGreen">Agroscope </span> © 2024-2025
        </p>

        <div className="flex gap-4">
          <a
            href="https://instagram.com/seuperfil"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram text-xl hover:text-gray-400 transition"></i>
          </a>
          <a
            href="https://github.com/Gabriel-Schiestl/Agroscope"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github text-xl hover:text-gray-400 transition"></i>
          </a>
          <a
            href="https://linkedin.com/in/seuperfil"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-linkedin text-xl hover:text-gray-400 transition"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
