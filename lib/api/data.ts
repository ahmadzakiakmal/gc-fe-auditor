export async function getDashboardData() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_AUTH_SERVICE}/api/data/user`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function getAllReports() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_REPORT_SERVICE}/`, {
    method: "GET",
    credentials: "include",
    headers: {
      Origin: "http://localhost:5001",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`Payment processing failed`);
  }

  return response.json();
}

