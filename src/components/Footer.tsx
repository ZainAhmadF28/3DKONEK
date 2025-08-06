// src/components/Footer.tsx
import React from 'react';
import { FaCogs, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0a2540] text-white pt-16 pb-8 px-6">
      <div className="container mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
            <div className="flex items-center font-bold text-2xl mb-4">
                <FaCogs className="mr-2 text-[#ff6b35]" />
                <span>KitaRekayasa</span>
            </div>
            <p className="text-gray-400">Kolaborasi Kita, Rekayasa Bangsa. Platform kolaborasi untuk kemandirian teknologi dan manufaktur Indonesia.</p>
        </div>
        <div>
            <h3 className="font-bold text-lg mb-4">Tautan</h3>
            <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Tantangan</a></li>
                <li><a href="#" className="hover:text-white">Manufaktur</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
        </div>
        <div>
            <h3 className="font-bold text-lg mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white">Kontak</a></li>
                <li><a href="#" className="hover:text-white">Karir</a></li>
            </ul>
        </div>
      </div>
      <div className="container mx-auto text-center border-t border-gray-700 pt-8">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} KitaRekayasa. Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  );
};

export default Footer;