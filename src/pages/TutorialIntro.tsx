import React from "react";

const TutorialIntro = () => {
  const supportItems = [
    {
      title: "Playbook Tips",
      description: "Daily guidance for Aarav",
    },
    {
      title: "Playbook Tips",
      description: "Daily guidance for Aarav",
    },
    {
      title: "Playbook Tips",
      description: "Daily guidance for Aarav",
    },
    {
      title: "Playbook Tips",
      description: "Daily guidance for Aarav",
    },
    {
      title: "Playbook Tips",
      description: "Daily guidance for Aarav",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[326px] flex flex-col items-center gap-12">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-9">
          <div className="flex flex-col items-stretch gap-8">
            <div className="flex flex-col items-stretch gap-2">
              <h1
                className="text-[28px] font-normal leading-[1.4] text-center text-[#393738]"
                style={{
                  fontFamily: "Replay Pro",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "28px",
                  lineHeight: "140%",
                  letterSpacing: "0px",
                  textAlign: "center",
                }}
              >
                Here's how we will <br />{" "}
                <span
                  style={{
                    fontFamily: "Replay Pro",
                    fontWeight: 400,
                    fontStyle: "italic",
                    fontSize: "28px",
                    lineHeight: "140%",
                    letterSpacing: "0px",
                    textAlign: "center",
                  }}
                >
                  support you.
                </span>
              </h1>
              <p
                className="text-[14px] font-medium leading-[1.5] text-center text-[#878787]"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Support that grows with your child.
              </p>
            </div>
          </div>

          {/* Support Items List */}
          <div className="w-[297px] flex flex-col justify-center gap-7 relative">
            {/* Connecting Line */}
            <div className="absolute left-[11.5px] top-[26.66px] w-0 h-[382px] border-l-[3px] border-dashed border-[#EBE9E9]" />

            {supportItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 w-full">
                {/* Check Icon */}
                <div className="w-6 h-6 rounded-full bg-[#F28433] flex items-center justify-center flex-shrink-0 relative z-10">
                  <svg
                    width="17"
                    height="12"
                    viewBox="0 0 17 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 5.5L6 10.5L16 0.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-[#FAF6F3] rounded-xl px-4 py-2.5 flex flex-col justify-center gap-1">
                  <h3
                    className="text-[16px] font-medium leading-[1.5] text-black tracking-[0.025em]"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[14px] font-medium leading-[1.26] text-[#878787] tracking-[0.0286em]"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialIntro;
