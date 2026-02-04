/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function getReportDetails(reportId: number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_REPORT_SERVICE}/details/${reportId}`, {
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

export async function updateReportSummary(reportId: number, summary: string) {
  console.log(process.env.NEXT_PUBLIC_GC_REPORT_SERVICE);

  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!summary || summary.trim() === "") {
    throw new Error("Summary cannot be empty.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_REPORT_SERVICE}/${reportId}/summary`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      summary: summary,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function updateFinding(
  findingId: number,
  data: {
    title?: string;
    severity?: string;
    explanation?: string;
    recommendation?: string;
  },
) {
  if (!findingId) {
    throw new Error("Finding ID is required.");
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error("At least one field must be provided for update.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_REPORT_SERVICE}/findings/${findingId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function getRepoFlows(repoId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_AST_SERVICE}/flow/all/${repoId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  const data = await response.json();
  const customFlows = data.data?.custom_flows || [];
  const testFlows = data.data?.test_flows || [];

  // Add type property
  customFlows.forEach((flow: any) => (flow.type = "custom"));
  testFlows.forEach((flow: any) => (flow.type = "test"));

  // Modify custom flows
  const modifiedCustomFlows = customFlows.map((flow: any) => {
    return { ...flow, flow: flow.flow_funtions };
  });

  return [...modifiedCustomFlows, ...testFlows];
}

export async function getRepoFunctions(repoId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_AST_SERVICE}/functions/${repoId}`, {
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

export async function createNewFlow(repoId: string, flowName: string, functions: any[]) {
  if (functions.length === 0) {
    throw new Error("Please add at least one function to create a flow.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_AST_SERVICE}/flow/custom/${repoId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: flowName,
      flow: functions,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function submitAiScan(
  repoId: string,
  flow_id: number[], //for custom flows
  test_name: string[], // for default flows
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_AST_SERVICE}/scan/${repoId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      flow_id,
      test_name,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function getAuditScope(auditId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_AST_SERVICE}/scope/${auditId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function createFinding(
  reportId: number,
  data: {
    title: string;
    severity: "high" | "medium" | "low";
    explanation: string;
    recommendation: string;
  },
) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!data.title || data.title.trim() === "") {
    throw new Error("Finding title is required.");
  }

  if (!data.explanation || data.explanation.trim() === "") {
    throw new Error("Finding explanation is required.");
  }

  if (!data.recommendation || data.recommendation.trim() === "") {
    throw new Error("Finding recommendation is required.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_REPORT_SERVICE}/${reportId}/findings`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: data.title,
      severity: data.severity,
      explanation: data.explanation,
      recommendation: data.recommendation,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}

export async function deleteFinding(findingId: number) {
  if (!findingId) {
    throw new Error("Finding ID is required.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_GC_REPORT_SERVICE}/findings/${findingId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized, try logging in again");
    }
    throw new Error(`HTTP Error ${response.status}`);
  }

  return response.json();
}
