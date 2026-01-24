"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, IndianRupee } from "lucide-react";
import { toast } from "sonner";

const AdminPage = () => {
  const router = useRouter();
  // const [playStoreDownloads, setPlayStoreDownloads] = useState(0);
  // const [appStoreDownloads, setAppStoreDownloads] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current stats on load
  useEffect(() => {
    const fetchCurrentStats = async () => {
      try {
        const response = await fetch("/api/downloads", {
          cache: "no-store",
        });
        
        if (response.ok) {
          const data = await response.json();
          // setPlayStoreDownloads(data.playstore || 0);
          // setAppStoreDownloads(data.appstore || 0);
          setRevenue(data.revenue || 0);
          setLastUpdated(new Date(data.lastUpdated));
        }
      } catch (error) {
        console.error("Error fetching current stats:", error);
        toast.error("Failed to load current statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentStats();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/admin/update-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // playstore: playStoreDownloads,
          // appstore: appStoreDownloads,
          revenue,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLastUpdated(new Date());
        toast.success("Statistics updated successfully!");
      } else {
        throw new Error(result.error || "Failed to update statistics");
      }
    } catch (error) {
      console.error("Error saving stats:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };


  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '4px solid rgba(118, 198, 255, 0.3)',
          borderTop: '4px solid #76c6ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f1419, #000000)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Back Button */}
      <div style={{ padding: '24px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            backgroundColor: 'rgba(55, 65, 81, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = 'rgba(75, 85, 99, 0.9)';
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = 'rgba(55, 65, 81, 0.8)';
            target.style.transform = 'translateY(0px)';
            target.style.boxShadow = 'none';
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 96px)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {/* Main Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(6, 18, 30, 0.95) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(118, 198, 255, 0.2)',
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.8),
              0 0 100px rgba(118, 198, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(118, 198, 255, 0.1) 0%, rgba(12, 164, 255, 0.05) 50%, rgba(118, 198, 255, 0.1) 100%)',
              borderBottom: '1px solid rgba(118, 198, 255, 0.2)',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #76c6ff 0%, #0ca4ff 100%)',
                  boxShadow: '0 0 20px rgba(118, 198, 255, 0.8)',
                  animation: 'pulse 2s infinite'
                }} />
                <div>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #76c6ff 0%, #0ca4ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.025em'
                  }}>
                    Edit Revenue
                  </h1>
                  <p style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: 'rgba(156, 163, 175, 0.8)'
                  }}>
                    Last updated: {formatDate(lastUpdated)}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}>
              {/* COMMENTED OUT - PlayStore and AppStore inputs */}
              {/*
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(118, 198, 255, 0.9)'
                }}>
                  PlayStore Downloads
                </label>
                <input
                  type="number"
                  value={playStoreDownloads}
                  onChange={(e) => setPlayStoreDownloads(parseInt(e.target.value) || 0)}
                  style={{
                    height: '64px',
                    width: '100%',
                    borderRadius: '16px',
                    border: '1px solid rgba(118, 198, 255, 0.2)',
                    background: 'rgba(17, 24, 39, 0.5)',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: '700',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#76c6ff';
                    target.style.boxShadow = '0 0 30px rgba(118, 198, 255, 0.3)';
                    target.style.background = 'rgba(17, 24, 39, 0.8)';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = 'rgba(118, 198, 255, 0.2)';
                    target.style.boxShadow = 'none';
                    target.style.background = 'rgba(17, 24, 39, 0.5)';
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(118, 198, 255, 0.9)'
                }}>
                  AppStore Downloads
                </label>
                <input
                  type="number"
                  value={appStoreDownloads}
                  onChange={(e) => setAppStoreDownloads(parseInt(e.target.value) || 0)}
                  style={{
                    height: '64px',
                    width: '100%',
                    borderRadius: '16px',
                    border: '1px solid rgba(118, 198, 255, 0.2)',
                    background: 'rgba(17, 24, 39, 0.5)',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: '700',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = '#76c6ff';
                    target.style.boxShadow = '0 0 30px rgba(118, 198, 255, 0.3)';
                    target.style.background = 'rgba(17, 24, 39, 0.8)';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.borderColor = 'rgba(118, 198, 255, 0.2)';
                    target.style.boxShadow = 'none';
                    target.style.background = 'rgba(17, 24, 39, 0.5)';
                  }}
                />
              </div>
              */}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(118, 198, 255, 0.9)'
                }}>
                  Revenue (INR)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(118, 198, 255, 0.7)',
                    zIndex: 1
                  }}>
                    <IndianRupee size={20} />
                  </div>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(parseInt(e.target.value) || 0)}
                    style={{
                      height: '64px',
                      width: '100%',
                      borderRadius: '16px',
                      border: '1px solid rgba(118, 198, 255, 0.2)',
                      background: 'rgba(17, 24, 39, 0.5)',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '700',
                      textAlign: 'center',
                      paddingLeft: '60px',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.borderColor = '#76c6ff';
                      target.style.boxShadow = '0 0 30px rgba(118, 198, 255, 0.3)';
                      target.style.background = 'rgba(17, 24, 39, 0.8)';
                    }}
                    onBlur={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.borderColor = 'rgba(118, 198, 255, 0.2)';
                      target.style.boxShadow = 'none';
                      target.style.background = 'rgba(17, 24, 39, 0.5)';
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  height: '64px',
                  width: '100%',
                  borderRadius: '16px',
                  border: 'none',
                  background: isSaving 
                    ? 'linear-gradient(135deg, rgba(118, 198, 255, 0.5) 0%, rgba(12, 164, 255, 0.5) 100%)'
                    : 'linear-gradient(135deg, #76c6ff 0%, #0ca4ff 100%)',
                  color: 'black',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(118, 198, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  opacity: isSaving ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(-2px)';
                    target.style.boxShadow = '0 12px 48px rgba(118, 198, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(0px)';
                    target.style.boxShadow = '0 8px 32px rgba(118, 198, 255, 0.3)';
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.3)',
                      borderTop: '2px solid black',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Display */}
          <div style={{
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <h2 style={{
              marginBottom: '32px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(118, 198, 255, 0.7)'
            }}>
              Current Value
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px'
            }}>
              {/* COMMENTED OUT - PlayStore and AppStore preview cards */}
              {/*
              <div style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(6, 18, 30, 0.8) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(118, 198, 255, 0.2)',
                padding: '24px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.transform = 'translateY(-4px)';
                target.style.boxShadow = '0 12px 40px rgba(118, 198, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.transform = 'translateY(0px)';
                target.style.boxShadow = 'none';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(118, 198, 255, 0.2) 0%, rgba(12, 164, 255, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#76c6ff'
                  }}>
                    <Smartphone size={24} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'rgba(156, 163, 175, 0.8)',
                      marginBottom: '4px'
                    }}>
                      PlayStore
                    </p>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: 'white'
                    }}>
                      {playStoreDownloads.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(6, 18, 30, 0.8) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(118, 198, 255, 0.2)',
                padding: '24px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.transform = 'translateY(-4px)';
                target.style.boxShadow = '0 12px 40px rgba(118, 198, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.transform = 'translateY(0px)';
                target.style.boxShadow = 'none';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(118, 198, 255, 0.2) 0%, rgba(12, 164, 255, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#76c6ff'
                  }}>
                    <Apple size={24} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'rgba(156, 163, 175, 0.8)',
                      marginBottom: '4px'
                    }}>
                      AppStore
                    </p>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: 'white'
                    }}>
                      {appStoreDownloads.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              */}

              <div style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(6, 18, 30, 0.8) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(118, 198, 255, 0.2)',
                padding: '24px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.transform = 'translateY(-4px)';
                target.style.boxShadow = '0 12px 40px rgba(118, 198, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLDivElement;
                target.style.transform = 'translateY(0px)';
                target.style.boxShadow = 'none';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(118, 198, 255, 0.2) 0%, rgba(12, 164, 255, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#76c6ff'
                  }}>
                    <IndianRupee size={24} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'rgba(156, 163, 175, 0.8)',
                      marginBottom: '4px'
                    }}>
                      Revenue
                    </p>
                    <p style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: 'white'
                    }}>
                      ₹{revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;