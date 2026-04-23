import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const GetStarted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      title: "COMPLETE YOUR PROFILE",
      paragraphs: [
        "Add your full name, company details, and profile image so freelancers can clearly understand who they are working with before submitting proposals. A complete profile builds confidence and helps professionals take your project more seriously from the very beginning.",
        "Verifying your email address confirms account authenticity and unlocks important platform features required to start hiring safely. Clients with verified accounts typically receive faster responses and higher-quality engagement from experienced freelancers."
      ]
    },
    {
      title: "POST YOUR FIRST JOB",
      paragraphs: [
        "Create a detailed job post that clearly explains your project goals, expectations, required skills, timeline, and preferred working style. A well-structured description helps attract freelancers who already have experience in similar projects and increases proposal quality.",
        "Providing realistic budgets and clear deliverables makes it easier for professionals to understand your priorities and respond with accurate timelines. Strong job posts significantly improve the chances of finding the right freelancer quickly."
      ],
      button: {
        text: "Post a job",
        route: "/client/post-job"
      }
    },
    {
      title: "FIND TALENT MANUALLY",
      paragraphs: [
        "Browse freelancers by category such as Development, AI Services, Marketing, Design, Writing, or Administration to quickly discover professionals that match your requirements. Category filtering allows you to explore specialists with relevant experience instead of reviewing unrelated profiles.",
        "You can also search directly using skills like React, Python, UI/UX design, or SEO to narrow results further. Reviewing portfolios, ratings, and completed work history helps you confidently invite the right freelancers before posting a job publicly."
      ],
      button: {
        text: "Find talent",
        route: "/client/find-talent"
      }
    },
    {
      title: "REVIEW PROPOSALS",
      paragraphs: [
        "Once your job is published, freelancers begin submitting proposals that include pricing details, delivery timelines, and suggested solutions. Carefully reviewing these proposals helps you compare multiple approaches and choose professionals who best understand your requirements.",
        "Checking ratings, previous project history, and communication clarity ensures you shortlist candidates who are reliable and experienced. Taking time during this stage improves long-term project success and reduces misunderstandings later."
      ]
    },
    {
      title: "HIRE FREELANCER",
      paragraphs: [
        "After selecting the right freelancer, confirm expectations clearly including deliverables, milestones, and communication preferences before starting the contract. Clear agreements at the beginning help both sides stay aligned throughout the project lifecycle.",
        "Starting contracts inside the platform keeps all discussions, files, and timelines organized in one workspace. This structure improves collaboration efficiency and ensures transparency for both clients and freelancers."
      ]
    },
    {
      title: "PAY SECURELY",
      paragraphs: [
        "Track progress through defined milestones and review submitted work before releasing payments. This milestone-based workflow helps maintain project quality and ensures deliverables meet your expectations before approval.",
        "Keeping transactions inside the platform protects both parties and maintains a complete payment history for future reference. Secure payments also strengthen trust and make long-term collaboration with freelancers easier and safer."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <Navbar />

      <div className="flex-grow py-10">
        <div className="max-w-[1400px] mx-auto px-6">

          {/* Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Header */}
          <div className="mb-14 text-left overflow-x-auto no-scrollbar">
            <h1 className="text-white whitespace-nowrap text-4xl font-bold">
              Get started and connect with talent to get work done
            </h1>
            <p className="text-gray-400 text-lg mt-3">
              Welcome to Connect! Follow these 6 onboarding steps to successfully hire top freelancers and manage your projects with ease.
            </p>
          </div>

          {/* Onboarding Steps */}
          <div className="flex flex-col">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`flex gap-6 items-start ${index === steps.length - 1 ? 'mb-20' : 'mb-12'}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-10 h-10 flex-shrink-0 rounded-full border border-accent text-accent flex items-center justify-center font-semibold text-lg"
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {index + 1}
                </motion.div>

                <div className="pt-1.5 flex-1">
                  <h2 className="text-accent text-xl font-semibold mb-4 uppercase tracking-wider">
                    {step.title}
                  </h2>
                  <div className={`text-gray-400 leading-relaxed text-lg space-y-4 ${step.button ? 'mb-6' : ''}`}>
                    {step.paragraphs.map((p, pIndex) => (
                      <p key={pIndex}>{p}</p>
                    ))}
                  </div>

                  {step.button && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                      onClick={() => navigate(step.button.route)}
                      className="inline-flex items-center justify-center px-7 py-3 rounded-full text-white font-medium bg-accent shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md"
                    >
                      {step.button.text}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GetStarted;
