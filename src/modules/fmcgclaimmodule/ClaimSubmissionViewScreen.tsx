import { useState, useEffect } from "react";
import { Button, Card, Spin, message, Tag, Divider, Modal, Form, Input } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fetch, getGcsDownloadUrl } from "../../apiClient";
import dayjs from "dayjs";

interface ClaimData {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  discount_start_date: string;
  discount_end_date: string;
  claim_amount: number;
  order_claim_amount: number;
  order_damaged_amount: number;
  supporting_documents: string;
  status: number;
  mismatch_reason: string | null;
}

interface ActionLogHistory {
  created_at: string;
  user_action: string;
  user_id: number;
  user_name: string;
  role_id: number;
  role_name: string;
  comments: string;
}

interface AllowedActionsResponse {
  allowed_actions: string[];
  action_log_history: ActionLogHistory[];
}

const STATUS_OPTIONS = [
  { value: 1, label: "ROM Submission Approval Pending", color: "orange" },
  { value: 2, label: "ROM Rejected", color: "red" },
  { value: 3, label: "LT Submission Approval Pending", color: "blue" },
  { value: 4, label: "LT Rejected", color: "red" },
  { value: 5, label: "Created", color: "default" },
  { value: 6, label: "Realized", color: "green" },
];

const getStatusLabel = (status: number) => {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || "";
};

const getStatusColor = (status: number) => {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color || "default";
};

const ROLE_NAME_MAPPING: Record<string, string> = {
  regionaloperationalmanager: "Regional Operational Manager",
  dbmanager: "DB Manager",
  udhtiger: "UDH Tiger",
};

const getSemanticColor = (action: string): string => {
  const actionMap: Record<string, string> = {
    Approve: "#ebfbf4",
    Reject: "#fef4ef",
    Resubmit: "#fff7ec",
  };
  return actionMap[action] || "#f2f8fe";
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "32px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#1A1A1A",
    margin: "0 0 24px 0",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1A1A1A",
    marginBottom: "16px",
  },
  fieldRow: {
    display: "flex",
    marginBottom: "16px",
    alignItems: "flex-start",
  },
  fieldLabel: {
    width: "250px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#1A1A1A",
  },
  fieldValue: {
    flex: 1,
    fontSize: "14px",
    color: "#4D4D4D",
  },
  fileList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
};

const ClaimSubmissionViewScreen = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const claimId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [allowedActions, setAllowedActions] = useState<string[]>([]);
  const [actionHistory, setActionHistory] = useState<ActionLogHistory[]>([]);
  const [isLifecycleModalVisible, setIsLifecycleModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (claimId) {
      fetchClaimData(claimId);
      fetchAllowedActions(claimId);
    }
  }, [claimId]);

  const fetchClaimData = async (id: string) => {
    setLoading(true);
    try {
      const warehouseId = localStorage.getItem("warehouse_id") || "0";
      const response = await fetch<{ success: boolean; message: string; data: ClaimData }>(
        "/sc2_admin/claim/show",
        { query: { id, warehouse_id: Number(warehouseId) } },
        {
          success: true,
          message: "fetched successfully",
          data: {
            id: 456,
            warehouse_id: 123,
            warehouse_name: "Dhaka Central Warehouse",
            discount_start_date: "2024-01-01",
            discount_end_date: "2024-01-31",
            claim_amount: 15000.5,
            order_claim_amount: 30000,
            order_damaged_amount: 0,
            supporting_documents: "/claim-docs.pdf,/claim-docs2.pdf",
            status: 1,
            mismatch_reason: null,
          },
        },
      );

      setClaimData(response.data);
    } catch (error: any) {
      console.error("Error fetching claim data:", error);
      message.error(error.message || "Failed to fetch claim data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    try {
      const url = await getGcsDownloadUrl(filePath, "/sc2_admin/get_gcs_download_url");
      window.open(url, "_blank");
    } catch (error: any) {
      console.error("Error downloading file:", error);
      message.error(error.message || "Failed to download file");
    }
  };

  const fetchAllowedActions = async (id: string) => {
    try {
      const response = await fetch<AllowedActionsResponse>(
        "/approval_service/approval_entity/entity_allowed_actions",
        { query: { entity_id: id, history_required: "true" } },
        {
          allowed_actions: ["Approve", "Reject", "Resubmit"],
          action_log_history: [
            {
              created_at: "2024-06-01T10:15:30Z",
              user_action: "Reject",
              user_id: 123,
              user_name: "John Doe",
              role_id: 456,
              role_name: "regionaloperationalmanager",
              comments: "Looks good to me.",
            },
            {
              created_at: "2024-05-28T14:22:10Z",
              user_action: "Resubmit",
              user_id: 789,
              user_name: "Jane Smith",
              role_id: 101,
              role_name: "dbmanager",
              comments: "Please review the attached documents.",
            },
            {
              created_at: "2024-05-25T09:05:45Z",
              user_action: "Approve",
              user_id: 234,
              user_name: "Alice Johnson",
              role_id: 456,
              role_name: "regionaloperationalmanager",
              comments: "Resubmitting after corrections.",
            },
            {
              created_at: "2024-05-20T11:30:00Z",
              user_action: "Approve",
              user_id: 345,
              user_name: "Bob Brown",
              role_id: 789,
              role_name: "udhtiger",
              comments: "Insufficient documentation.",
            },
          ],
        },
      );

      setAllowedActions(response.allowed_actions);
      setActionHistory(response.action_log_history);
    } catch (error: any) {
      console.error("Error fetching allowed actions:", error);
      message.error(error.message || "Failed to fetch allowed actions");
    }
  };

  const handleViewLifecycle = () => {
    setIsLifecycleModalVisible(true);
  };

  const handleActionClick = (action: string) => {
    if (action === "Resubmit") {
      history.push(`claimsubmissionedit?id=${claimId}`);
    } else {
      setSelectedAction(action);
      setIsActionModalVisible(true);
    }
  };

  const handleActionModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        entity_id: claimId,
        user_action: selectedAction,
        notes: values.notes || "",
      };

      const response = await fetch<{ status: string; is_error: boolean; message: string }>(
        "/approval_service/approval_entity/upsert_entity_action",
        {
          method: "POST",
          body: payload,
        },
        {
          status: "200",
          is_error: false,
          message: "Action recorded successfully.",
        },
      );

      message.success(response.message);
      setIsActionModalVisible(false);
      form.resetFields();
      fetchClaimData(claimId!);
      fetchAllowedActions(claimId!);
    } catch (error: any) {
      console.error("Error submitting action:", error);
      message.error(error.message || "Failed to submit action");
    } finally {
      setLoading(false);
    }
  };

  const handleActionModalCancel = () => {
    setIsActionModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div
        style={{
          ...styles.container,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!claimData) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Claim not found</h1>
      </div>
    );
  }

  const claimUsedAmount = claimData.order_claim_amount + claimData.order_damaged_amount;
  const mismatch = claimUsedAmount - claimData.claim_amount;
  const supportingDocs = claimData.supporting_documents.split(",").filter((doc) => doc);

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button icon={<ArrowLeft size={20} />} onClick={() => history.goBack()} type="text" />
          <h1 style={{ ...styles.heading, margin: 0 }}>View Claim - {claimData.id}</h1>
        </div>
        <Tag color={getStatusColor(claimData.status)}>{getStatusLabel(claimData.status)}</Tag>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <Card>
          <h2 style={styles.sectionTitle}>Claim details</h2>
          <Divider style={{ margin: "0 0 16px 0" }} />
          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Claim ID</div>
            <div style={styles.fieldValue}>{claimData.id}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>From date</div>
            <div style={styles.fieldValue}>{dayjs(claimData.discount_start_date).format("DD MMM YYYY")}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>To date</div>
            <div style={styles.fieldValue}>{dayjs(claimData.discount_end_date).format("DD MMM YYYY")}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>DB ID</div>
            <div style={styles.fieldValue}>{claimData.warehouse_id}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>DB Name</div>
            <div style={styles.fieldValue}>{claimData.warehouse_name}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Order claim amount</div>
            <div style={styles.fieldValue}>৳{claimData.order_claim_amount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Order damage amount</div>
            <div style={styles.fieldValue}>৳{claimData.order_damaged_amount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Claim used amount</div>
            <div style={styles.fieldValue}>৳{claimUsedAmount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Anchor claim amount</div>
            <div style={styles.fieldValue}>৳{claimData.claim_amount.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Mismatch</div>
            <div style={styles.fieldValue}>৳{mismatch.toFixed(2)}</div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>Anchor system file(s)</div>
            <div style={styles.fieldValue}>
              <div style={styles.fileList}>
                {supportingDocs.map((doc, index) => (
                  <Button
                    key={index}
                    type="link"
                    onClick={() => handleDownloadFile(doc)}
                    style={{ padding: 0, textAlign: "left" }}
                  >
                    {doc.split("/").pop() || `Document ${index + 1}`}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.fieldRow}>
            <div style={styles.fieldLabel}>View lifecycle</div>
            <div style={styles.fieldValue}>
              <Button type="link" onClick={handleViewLifecycle} style={{ padding: 0 }}>
                View
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {allowedActions.length > 0 && (
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          {allowedActions.map((action) => (
            <Button key={action} onClick={() => handleActionClick(action)}>
              {action}
            </Button>
          ))}
        </div>
      )}

      <Modal
        title="View Lifecycle"
        open={isLifecycleModalVisible}
        onCancel={() => setIsLifecycleModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsLifecycleModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <div style={{ marginTop: "16px" }}>
          {actionHistory.map((log, index) => (
            <div key={index}>
              <div style={{ padding: "16px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#4D4D4D" }}>
                    {dayjs(log.created_at).format("DD MMM YYYY")} | {dayjs(log.created_at).format("hh:mm A")}
                  </div>
                  <Tag style={{ backgroundColor: getSemanticColor(log.user_action), border: "none", color: "#333333" }}>
                    {log.user_action}
                  </Tag>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#1A1A1A", marginBottom: "4px" }}>
                  {ROLE_NAME_MAPPING[log.role_name] || log.role_name}
                </div>
                <div style={{ fontSize: "14px", color: "#4D4D4D", marginBottom: "8px" }}>{log.user_name}</div>
                <div style={{ fontSize: "14px", color: "#4D4D4D" }}>
                  <strong>Comments:</strong> {log.comments}
                </div>
              </div>
              {index < actionHistory.length - 1 && <Divider style={{ margin: 0 }} />}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        title={`Do you want to ${selectedAction.toLowerCase()} this claim?`}
        open={isActionModalVisible}
        onOk={handleActionModalOk}
        onCancel={handleActionModalCancel}
        okText={`Yes, ${selectedAction.toLowerCase()}`}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        {claimData && Math.abs(claimUsedAmount - claimData.claim_amount) > 0 && (
          <p style={{ color: "#F94949", marginBottom: "16px" }}>
            Gap of ৳{Math.abs(claimUsedAmount - claimData.claim_amount).toFixed(2)} mismatched amount is present in the
            claim. You may be penalised for the gap amount.
          </p>
        )}

        <div style={{ marginBottom: "16px" }}>
          <p style={{ marginBottom: "8px" }}>
            <strong>Claim used amount:</strong> ৳{claimUsedAmount.toFixed(2)}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Anchor claim amount:</strong> ৳{claimData?.claim_amount.toFixed(2)}
          </p>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Notes"
            name="notes"
            rules={[
              {
                required: claimData && Math.abs(claimUsedAmount - claimData.claim_amount) > 0,
                message: "Please provide notes for the mismatch",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClaimSubmissionViewScreen;
