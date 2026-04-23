import React from "react";
import { FaUserPlus, FaSearch, FaHandshake, FaMoneyBillWave } from "react-icons/fa";

const steps = [
  {
    icon: <img src="/Icons/icons8-add-administrator-100.png" alt="Create Account" className="w-14 h-14 object-contain" />,
    title: "Create an Account",
    description:
      "Sign up as a freelancer or a client and create your profile with skills, experience, or project requirements.",
  },
  {
    icon: <img src="/Icons/icons8-search-64.png" alt="Find Talent or Projects" className="w-14 h-14 object-contain" />,
    title: "Find Talent or Projects",
    description:
      "Clients can browse freelancers and freelancers can explore projects that match their expertise.",
  },
  {
    icon: <img src="/Icons/icons8-meeting-room-100.png" alt="Collaborate on Projects" className="w-14 h-14 object-contain" />,
    title: "Collaborate on Projects",
    description:
      "Communicate, share files, and track progress easily using our collaboration tools.",
  },
  {
    icon: <img src="/Icons/icons8-money-bag-rupee-100.png" alt="Secure Payments" className="w-14 h-14 object-contain" />,
    title: "Secure Payments",
    description:
      "Payments are handled securely through our escrow system to ensure trust for both sides.",
  },
];

const HowConnectWorks = () => {
  return (
    <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h2 className="text-xl sm:text-3xl font-semibold mb-8 sm:mb-12">
        How Connect Works
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
        {steps.map((step, index) => (
          <div key={index} className="bg-transparent border border-white/10 hover:border-accent transition-colors duration-300 rounded-xl p-4 sm:p-6 text-center">
            <div className="text-accent text-3xl mb-3 sm:mb-4 flex justify-center">
              {step.icon}
            </div>
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              {step.title}
            </h3>
            <p className="text-white/60 text-xs sm:text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowConnectWorks;