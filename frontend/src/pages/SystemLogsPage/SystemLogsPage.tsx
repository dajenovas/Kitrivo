import React, { useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Pagination,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Assignment as LogIcon,
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Security as SecurityIcon,
  ClearAll as ClearIcon,
} from "@mui/icons-material";
import { useAppTheme, THEME } from "@/assets/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useLogStore } from "@/store/useLogStore";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomSelect } from "@/components/Inputs/CustomSelect";
import { CustomButton } from "@/components/Buttons/CustomButton";
import type { SelectOption } from "@/types/input.types";

const ACTION_OPTIONS: SelectOption[] = [
  { id: "ALL", label: "All Actions" },
  { id: "CREATE", label: "CREATE" },
  { id: "UPDATE", label: "UPDATE" },
  { id: "DELETE", label: "DELETE" },
  { id: "LOGIN", label: "LOGIN" },
  { id: "PASSWORD_CHANGE", label: "PASSWORD CHANGE" },
  { id: "PASSWORD_RESET", label: "PASSWORD RESET" },
  { id: "STATUS_CHANGE", label: "STATUS CHANGE" },
];

export const SystemLogsPage: React.FC = () => {
  const theme = useAppTheme();
  const user = useAuthStore((state) => state.user);

  const {
    logs,
    total,
    page,
    totalPages,
    modules,
    isLoading,
    error,
    search,
    selectedModule,
    selectedAction,
    startDate,
    endDate,
    selectedLog,
    detailModalOpen,
    fetchLogs,
    fetchModules,
    setSearch,
    setSelectedModule,
    setSelectedAction,
    setDateRange,
    resetFilters,
    openDetailModal,
    closeDetailModal,
  } = useLogStore();

  const isSuperAdmin = Boolean(
    user?.roles?.some(
      (r) => r.code === "ROLE_SUPERADMIN" || r.name === "SuperAdmin" || r.name === "Super Admin"
    )
  );

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs(1);
      fetchModules();
    }
  }, [isSuperAdmin]);

  const moduleOptions: SelectOption[] = React.useMemo(() => {
    return [
      { id: "ALL", label: "All Modules" },
      ...modules.map((m) => ({ id: m, label: m })),
    ];
  }, [modules]);

  if (!isSuperAdmin) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            maxWidth: 540,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${THEME.error}40`,
            bgcolor: theme.isDark ? "rgba(220, 38, 38, 0.05)" : "#FEF2F2",
          }}
        >
          <SecurityIcon sx={{ fontSize: 64, color: THEME.error, mb: 2 }} />
          <Typography variant="h5" fontWeight={800} color={THEME.error} mb={1}>
            Access Restricted (SuperAdmin Only)
          </Typography>
          <Typography fontSize="14px" color={theme.textSecondary} mb={3}>
            The System Activity Audit Logs page contains confidential tracking records for all application changes and is restricted exclusively to SuperAdmin accounts.
          </Typography>
          <CustomButton
            text="Return to Dashboard"
            bgc={THEME.primary}
            color="#FFFFFF"
            onClick={() => (window.location.href = "/dashboard")}
          />
        </Paper>
      </Box>
    );
  }

  // Count stats
  const createCount = logs.filter((l) => l.action === "CREATE").length;
  const updateCount = logs.filter((l) => l.action === "UPDATE").length;
  const deleteCount = logs.filter((l) => l.action === "DELETE").length;

  const getActionChip = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return <Chip label="CREATE" size="small" sx={{ bgcolor: "#DCFCE7", color: "#166534", fontWeight: 800, fontSize: "11px" }} icon={<AddIcon style={{ color: "#166534", fontSize: 14 }} />} />;
      case "UPDATE":
        return <Chip label="UPDATE" size="small" sx={{ bgcolor: "#E0F2FE", color: "#075985", fontWeight: 800, fontSize: "11px" }} icon={<EditIcon style={{ color: "#075985", fontSize: 14 }} />} />;
      case "DELETE":
        return <Chip label="DELETE" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 800, fontSize: "11px" }} icon={<DeleteIcon style={{ color: "#991B1B", fontSize: 14 }} />} />;
      case "LOGIN":
        return <Chip label="LOGIN" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 800, fontSize: "11px" }} icon={<SecurityIcon style={{ color: "#92400E", fontSize: 14 }} />} />;
      case "PASSWORD_CHANGE":
      case "PASSWORD_RESET":
        return <Chip label={action.replace("_", " ")} size="small" sx={{ bgcolor: "#F3E8FF", color: "#6B21A8", fontWeight: 800, fontSize: "11px" }} icon={<SecurityIcon style={{ color: "#6B21A8", fontSize: 14 }} />} />;
      default:
        return <Chip label={action} size="small" sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 800, fontSize: "11px" }} />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box p={3.5}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <LogIcon sx={{ fontSize: 32, color: THEME.primary }} />
            <Typography variant="h4" fontWeight={800} color={theme.textPrimary}>
              System Activity Audit Logs
            </Typography>
            <Chip
              label="SuperAdmin Exclusive"
              size="small"
              sx={{ bgcolor: `${THEME.primary}15`, color: THEME.primary, fontWeight: 700, fontSize: "11px" }}
            />
          </Box>
          <Typography fontSize="14px" color={theme.textSecondary}>
            Comprehensive date-stamped trail of all application state changes, entity updates, logins, and system events.
          </Typography>
        </Box>

        <IconButton onClick={() => fetchLogs(page)} sx={{ bgcolor: theme.isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }}>
          <RefreshIcon sx={{ color: THEME.primary }} />
        </IconButton>
      </Box>

      {/* Overview Stats Row */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.cardBg }}>
            <Typography fontSize="12px" fontWeight={700} color={theme.textSecondary} textTransform="uppercase" mb={0.5}>
              Total Log Entries
            </Typography>
            <Typography variant="h4" fontWeight={800} color={THEME.primary}>
              {total.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.cardBg }}>
            <Typography fontSize="12px" fontWeight={700} color="#166534" textTransform="uppercase" mb={0.5}>
              Create Operations (Page)
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#166534">
              {createCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.cardBg }}>
            <Typography fontSize="12px" fontWeight={700} color="#075985" textTransform="uppercase" mb={0.5}>
              Update Operations (Page)
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#075985">
              {updateCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.cardBg }}>
            <Typography fontSize="12px" fontWeight={700} color="#991B1B" textTransform="uppercase" mb={0.5}>
              Delete Operations (Page)
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#991B1B">
              {deleteCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter Controls Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.cardBg }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={3.5}>
            <CustomInput
              fullWidth
              size="small"
              placeholder="Search description, user, email, or entity ID..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ color: theme.textSecondary, mr: 0.5 }} /> }}
            />
          </Grid>

          {/* Module Filter */}
          <Grid item xs={12} sm={6} md={2.5}>
            <CustomSelect
              label=""
              placeholder="Filter Module..."
              value={selectedModule}
              options={moduleOptions}
              onChange={(val) => setSelectedModule(String(val))}
            />
          </Grid>

          {/* Action Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <CustomSelect
              label=""
              placeholder="Filter Action..."
              value={selectedAction}
              options={ACTION_OPTIONS}
              onChange={(val) => setSelectedAction(String(val))}
            />
          </Grid>

          {/* Start Date */}
          <Grid item xs={6} md={1.5}>
            <CustomInput
              type="date"
              size="small"
              value={startDate}
              onChange={(e: any) => setDateRange(e.target.value, endDate)}
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={6} md={1.5}>
            <CustomInput
              type="date"
              size="small"
              value={endDate}
              onChange={(e: any) => setDateRange(startDate, e.target.value)}
            />
          </Grid>

          {/* Clear Filters */}
          <Grid item xs={12} md={1} textAlign="right">
            <Tooltip title="Reset all filters">
              <IconButton onClick={resetFilters} sx={{ border: `1px solid ${theme.border}` }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Audit Logs Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: theme.cardBg }}>
        <Table size="medium">
          <TableHead sx={{ bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, width: 190 }}>Timestamp (Date & Time)</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>User Identity</TableCell>
              <TableCell sx={{ fontWeight: 800, width: 120 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 800, width: 170 }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Detailed Summary Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, width: 110 }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton width={130} /></TableCell>
                  <TableCell><Skeleton width={180} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={260} /></TableCell>
                  <TableCell align="right"><Skeleton width={60} /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography fontSize="15px" fontWeight={600} color={theme.textSecondary}>
                    No audit logs match your search filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover sx={{ "&:hover": { bgcolor: theme.isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC" } }}>
                  {/* Timestamp */}
                  <TableCell sx={{ fontSize: "13px", fontWeight: 600, color: theme.textPrimary }}>
                    {formatDate(log.created_at)}
                  </TableCell>

                  {/* User Identity */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.2}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: "13px", fontWeight: 700, bgcolor: THEME.primary }}>
                        {(log.user_name || log.user_email || "U").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontSize="13px" fontWeight={700} color={theme.textPrimary}>
                          {log.user_name || "System User"}
                        </Typography>
                        <Typography fontSize="11px" color={theme.textSecondary}>
                          {log.user_email || "N/A"} • <span style={{ fontWeight: 600 }}>{log.user_role || "User"}</span>
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Action Badge */}
                  <TableCell>
                    {getActionChip(log.action)}
                  </TableCell>

                  {/* Module Tag */}
                  <TableCell>
                    <Chip label={log.module} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "12px" }} />
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <Typography fontSize="13px" fontWeight={600} color={theme.textPrimary}>
                      {log.description}
                    </Typography>
                    {log.entity_type && (
                      <Typography fontSize="11px" color={theme.textSecondary} mt={0.2}>
                        Entity: {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                      </Typography>
                    )}
                  </TableCell>

                  {/* View Details Action */}
                  <TableCell align="right">
                    <Tooltip title="Inspect JSON payload & details">
                      <IconButton size="small" onClick={() => openDetailModal(log)} sx={{ color: THEME.primary }}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
          <Typography fontSize="13px" color={theme.textSecondary}>
            Showing page {page} of {totalPages} ({total.toLocaleString()} total entries)
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => fetchLogs(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* JSON Inspector Detail Modal */}
      <Dialog open={detailModalOpen} onClose={closeDetailModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <LogIcon sx={{ color: THEME.primary }} />
            <Typography fontWeight={800} fontSize="18px">
              Audit Log Detail #{selectedLog?.id}
            </Typography>
          </Box>
          <IconButton onClick={closeDetailModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedLog && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography fontSize="12px" fontWeight={700} color={theme.textSecondary}>Date & Time</Typography>
                  <Typography fontSize="13px" fontWeight={600}>{formatDate(selectedLog.created_at)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography fontSize="12px" fontWeight={700} color={theme.textSecondary}>User</Typography>
                  <Typography fontSize="13px" fontWeight={600}>{selectedLog.user_name} ({selectedLog.user_role})</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography fontSize="12px" fontWeight={700} color={theme.textSecondary}>Module / Action</Typography>
                  <Typography fontSize="13px" fontWeight={600}>{selectedLog.module} • {selectedLog.action}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography fontSize="12px" fontWeight={700} color={theme.textSecondary}>Client IP Address</Typography>
                  <Typography fontSize="13px" fontWeight={600}>{selectedLog.ip_address || "127.0.0.1"}</Typography>
                </Grid>
              </Grid>

              <Box bgcolor={theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC"} p={2} borderRadius={2} border={`1px solid ${theme.border}`}>
                <Typography fontSize="13px" fontWeight={700} mb={1}>
                  Description:
                </Typography>
                <Typography fontSize="14px" color={theme.textPrimary}>
                  {selectedLog.description}
                </Typography>
              </Box>

              <Box>
                <Typography fontSize="13px" fontWeight={700} mb={1}>
                  Payload & Modification Diff (JSON):
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "#1E293B",
                    color: "#38BDF8",
                    borderRadius: 2,
                    fontFamily: "monospace",
                    fontSize: "12px",
                    maxHeight: 260,
                    overflowY: "auto",
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {selectedLog.changes_diff
                      ? JSON.stringify(selectedLog.changes_diff, null, 2)
                      : JSON.stringify({ message: "No raw payload diff recorded for this action." }, null, 2)}
                  </pre>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <CustomButton text="Close" bgc={THEME.primary} color="#FFFFFF" onClick={closeDetailModal} />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemLogsPage;
