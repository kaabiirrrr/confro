import React from "react";

const problems = [
  {
    question: "Struggling to find reliable freelancers?",
    answer:
      "Many businesses waste time searching for skilled professionals who can deliver quality work.",
  },
  {
    question: "Freelancers unable to find consistent projects?",
    answer:
      "Talented freelancers often struggle to connect with the right clients and opportunities.",
  },
  {
    question: "Payment and trust issues?",
    answer:
      "Clients and freelancers worry about payment security and fair project completion.",
  },
  {
    question: "Poor communication during projects?",
    answer:
      "Miscommunication between clients and freelancers leads to delays and project failures.",
  },
];

const solutions = [
  {
    title: "Verified Freelancers",
    description:
      "Our platform verifies freelancer profiles and portfolios so clients can hire with confidence.",
  },
  {
    title: "Smart Project Matching",
    description:
      "AI-powered recommendations help freelancers find projects suited to their skills.",
  },
  {
    title: "Secure Payments",
    description:
      "Escrow-based payment protection ensures both freelancers and clients are protected.",
  },
  {
    title: "Built-in Collaboration Tools",
    description:
      "Integrated messaging and project tracking make communication seamless.",
  },
];

const Solutions = () => {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-24">

      {/* Title */}
      <h2 className="text-4xl font-semibold mb-4">
        Solutions
      </h2>

      <p className="text-white/60 mb-16">
        Discover how Connect helps freelancers and businesses collaborate efficiently.
      </p>

      {/* Problems */}
      <div className="mb-20">

        <h3 className="text-2xl font-semibold mb-8">
          Problems People Face
        </h3>

        <div className="grid md:grid-cols-2 gap-8">

          {problems.map((item, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-lg p-6"
            >
              <h4 className="text-lg font-semibold mb-3">
                {item.question}
              </h4>

              <p className="text-white/60 text-sm">
                {item.answer}
              </p>
            </div>
          ))}

        </div>

      </div>

      {/* Solutions */}
      <div>

        <h3 className="text-2xl font-semibold mb-8">
          How Connect Solves These Problems
        </h3>

        <div className="grid md:grid-cols-2 gap-8">

          {solutions.map((item, index) => (
            <div
              key={index}
              className="bg-secondary border border-white/10 rounded-lg p-6"
            >
              <h4 className="text-lg font-semibold mb-3">
                {item.title}
              </h4>

              <p className="text-white/60 text-sm">
                {item.description}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default Solutions;