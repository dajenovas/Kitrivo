import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, Grid, Button, Paper, Alert, Divider } from "@mui/material";
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Business as BusinessIcon, Person as PersonIcon } from "@mui/icons-material";
import { CustomInput } from "@/components/Inputs/CustomInput";
import { CustomSelect } from "@/components/Inputs/CustomSelect";
import { CustomButton } from "@/components/Buttons/CustomButton";
import { useAppTheme, THEME } from "@/assets/theme";
import { CustomerService } from "@/services/customer.service";
import type { CustomerModel, ContactPerson, CustomerCreatePayload } from "@/models/customer.models";

interface AddEditCustomerOverlayProps {
    open: boolean;
    customer?: CustomerModel | null;
    onClose: () => void;
    onSaved: () => void;
}

export const AddEditCustomerOverlay: React.FC<AddEditCustomerOverlayProps> = ({ open, customer, onClose, onSaved }) => {
    const theme = useAppTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [companyName, setCompanyName] = useState("");
    const [customerType, setCustomerType] = useState("COLLEGE");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [gstin, setGstin] = useState("");
    const [pan, setPan] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [notes, setNotes] = useState("");
    const [contactPersons, setContactPersons] = useState<ContactPerson[]>([
        { name: "", designation: "", phone: "", email: "" }
    ]);

    useEffect(() => {
        if (customer) {
            setCompanyName(customer.company_name || "");
            setCustomerType(customer.customer_type || "COLLEGE");
            setEmail(customer.email || "");
            setPhone(customer.phone || "");
            setBillingAddress(customer.billing_address || "");
            setShippingAddress(customer.shipping_address || customer.billing_address || "");
            setGstin(customer.gstin || "");
            setPan(customer.pan || "");
            setCity(customer.city || "");
            setState(customer.state || "");
            setNotes(customer.notes || "");
            setContactPersons(
                customer.contact_persons && customer.contact_persons.length > 0
                    ? customer.contact_persons
                    : [{ name: "", designation: "", phone: "", email: "" }]
            );
        } else {
            resetForm();
        }
    }, [customer, open]);

    const resetForm = () => {
        setCompanyName("");
        setCustomerType("COLLEGE");
        setEmail("");
        setPhone("");
        setBillingAddress("");
        setShippingAddress("");
        setGstin("");
        setPan("");
        setCity("");
        setState("");
        setNotes("");
        setContactPersons([{ name: "", designation: "", phone: "", email: "" }]);
        setError(null);
    };

    const handleAddContact = () => {
        setContactPersons([...contactPersons, { name: "", designation: "", phone: "", email: "" }]);
    };

    const handleRemoveContact = (index: number) => {
        setContactPersons(contactPersons.filter((_, idx) => idx !== index));
    };

    const handleContactChange = (index: number, field: keyof ContactPerson, value: string) => {
        const updated = [...contactPersons];
        updated[index] = { ...updated[index], [field]: value };
        setContactPersons(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim()) {
            setError("Company / Institution Name is required.");
            return;
        }

        setLoading(true);
        setError(null);

        const validContacts = contactPersons.filter((c) => c.name.trim() !== "");

        const payload: CustomerCreatePayload = {
            company_name: companyName.trim(),
            customer_type: customerType,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            billing_address: billingAddress.trim() || undefined,
            shipping_address: shippingAddress.trim() || billingAddress.trim() || undefined,
            gstin: gstin.trim() || undefined,
            pan: pan.trim() || undefined,
            city: city.trim() || undefined,
            state: state.trim() || undefined,
            notes: notes.trim() || undefined,
            contact_persons: validContacts,
        };

        try {
            if (customer) {
                await CustomerService.updateCustomer(customer.id, payload);
            } else {
                await CustomerService.createCustomer(payload);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save customer account details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.paperBg } }}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2.5, borderBottom: `1px solid ${theme.border}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.isDark ? "rgba(37,99,235,0.2)" : "#EFF6FF", color: THEME.primary, display: "flex" }}>
                        <BusinessIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: theme.textPrimary, fontSize: "1.15rem" }}>
                            {customer ? "Edit Customer Profile" : "Add New Customer"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                            Enter institutional details, GSTIN, and contact persons for repeat billing
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: theme.textSecondary }}>
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2.5, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Section 1: Institution Details */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 0.5 }}>
                        1. Institutional Profile
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={8}>
                            <CustomInput label="Company / Institution Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. ABC Engineering College" required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <CustomSelect
                              label="Customer Type"
                              value={customerType}
                              options={[
                                { id: "COLLEGE", label: "College" },
                                { id: "UNIVERSITY", label: "University" },
                                { id: "POLYTECHNIC", label: "Polytechnic" },
                                { id: "RESEARCH_LAB", label: "Research Lab" },
                                { id: "CORPORATE", label: "Corporate" },
                                { id: "OTHER", label: "Other" },
                              ]}
                              onChange={(val) => setCustomerType(String(val))}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <CustomInput label="Institutional Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. purchase@abc.edu.in" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CustomInput label="Primary Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <CustomInput label="GSTIN Number" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="e.g. 27AAACA1234F1Z5" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CustomInput label="PAN Number" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="e.g. AAACA1234F" />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <CustomInput label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CustomInput label="State" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Maharashtra" />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <CustomInput label="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Full billing address..." multiline rows={3} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CustomInput label="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Full lab delivery address..." multiline rows={3} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Section 2: Contact Persons */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 0.5 }}>
                            2. Contact Persons (HOD / Lab Incharge / Procurement)
                        </Typography>
                        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={handleAddContact} sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "none", color: THEME.primary }}>
                            Add Contact
                        </Button>
                    </Box>

                    {contactPersons.map((contact, idx) => (
                        <Paper key={idx} elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: theme.isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", border: `1px solid ${theme.border}` }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.textSecondary, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <PersonIcon sx={{ fontSize: 15 }} /> Contact Person #{idx + 1}
                                </Typography>
                                {contactPersons.length > 1 && (
                                    <IconButton size="small" onClick={() => handleRemoveContact(idx)} sx={{ color: THEME.error }}>
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                )}
                            </Box>
                            <Grid container spacing={1.5}>
                                <Grid item xs={12} sm={6}>
                                    <CustomInput label="Name" value={contact.name} onChange={(e) => handleContactChange(idx, "name", e.target.value)} placeholder="e.g. Prof. Rajesh Sharma" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <CustomInput label="Designation" value={contact.designation || ""} onChange={(e) => handleContactChange(idx, "designation", e.target.value)} placeholder="e.g. HOD Electronics" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <CustomInput label="Phone" value={contact.phone || ""} onChange={(e) => handleContactChange(idx, "phone", e.target.value)} placeholder="+91 98765 43210" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <CustomInput label="Email" value={contact.email || ""} onChange={(e) => handleContactChange(idx, "email", e.target.value)} placeholder="r.sharma@abc.edu.in" />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}

                    <Divider sx={{ my: 2.5 }} />

                    {/* Section 3: Customer Notes */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: THEME.primary, mb: 1.5, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 0.5 }}>
                        3. Institutional Notes & Preferences
                    </Typography>
                    <CustomInput label="Internal Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Credit terms, tax exemption details, specific lab delivery requirements..." multiline rows={2} />
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.border}` }}>
                    <CustomButton text="Cancel" onClick={onClose} bgc="transparent" color={theme.textSecondary} height={40} />
                    <CustomButton text={customer ? "Update Customer" : "Save Customer"} type="submit" disabled={loading} Sicon={<SaveIcon sx={{ fontSize: 18 }} />} bgc={THEME.primary} color="#FFFFFF" height={40} />
                </DialogActions>
            </form>
        </Dialog>
    );
};
