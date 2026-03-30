import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgreementProps {
  visible: boolean;
  onClose: () => void;
  onSignAndProceed: () => void | Promise<void>;
  isSigning: boolean;
  planName: string;
  durationName: string;
  amount: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  aadhaarNumber: string;
  signatureUrl?: string | null;
}

const AgreementDocumentModal: React.FC<AgreementProps> = ({
  visible,
  onClose,
  onSignAndProceed,
  isSigning,
  planName,
  durationName,
  amount,
  userName,
  userEmail,
  userPhone,
  aadhaarNumber,
  signatureUrl,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const currentYear = new Date().getFullYear();
  const agreementNo = `AGR-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
  const displayInvoiceNo = `INV${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  /* --- Helper Components --- */
  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.paragraph}>{children}</Text>
  );

  const Bullet = ({ prefix = "•", children }: { prefix?: string, children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletPrefix}>{prefix}</Text>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  );

  const SectionHeading = ({ part, title }: { part?: string, title: string }) => (
    <View style={styles.sectionCenter}>
      {part && <Text style={styles.partHeading}>{part}</Text>}
      <Text style={styles.mainHeading}>{title}</Text>
    </View>
  );

  const SubHeading = ({ title }: { title: string }) => (
    <Text style={styles.subHeading}>{title}</Text>
  );

  const TitleStrip = ({ title }: { title: string }) => (
    <Text style={styles.titleStrip}>{title}</Text>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <View style={styles.iconBox}>
              <Ionicons name="document-text" size={20} color="#bae6fd" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Research Analyst Service Agreement</Text>
              <Text style={styles.headerSub}>Reg No. INH000023728 | Bharat Stock Market Research</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSigning}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE DOCUMENT */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.documentPaper}>
            
            <View style={styles.docTracking}>
              <Text style={styles.trackingText}>Agreement No: {agreementNo}</Text>
              <Text style={styles.trackingText}>Invoice No: {displayInvoiceNo}</Text>
            </View>

            <SectionHeading part="PART A" title="CLIENT AGREEMENT AND TERMS AND CONDITIONS" />

            <TitleStrip title="INTRODUCTION" />
            <Paragraph>This Agreement (“Agreement”) is entered into by and between:</Paragraph>
            <Bullet prefix="(a)">
              Research Analyst (hereinafter referred to as the “RA,” “We,” “Our” or “Us”), being a person/entity duly registered with the Securities and Exchange Board of India (“SEBI”) under Registration No. <Text style={styles.boldText}>INH000023728</Text> and in the name of <Text style={styles.boldText}>Namita Rathore Proprietor of Bharat Stock Market Research</Text>; and
            </Bullet>
            <Bullet prefix="(b)">
              Client / User (hereinafter referred to as “You,” “Your” or “the Client”), being the individual or legal entity subscribing to or availing of the research services provided by the RA, and who satisfies the eligibility criteria set out in this Agreement and under all applicable laws of India. <Text style={styles.boldText}>({userName})</Text>
            </Bullet>
            <Paragraph>The RA and the Client are hereinafter collectively referred to as the “Parties” and individually as a “Party.”</Paragraph>

            <TitleStrip title="PURPOSE" />
            <SubHeading title="Scope and Application" />
            <Paragraph>These Terms and Conditions (“T&C”) govern the Client’s access to, subscription for, and/or use of the research services provided by the RA (“Services”), including, without limitation, any digital platforms, applications, technology interfaces, or other delivery mechanisms made available by the RA or its authorised service provider(s) from time to time.</Paragraph>
            
            <SubHeading title="Compliance with SEBI Circular and Regulations" />
            <Bullet prefix="(a)">These T&C incorporate the minimum mandatory provisions prescribed under SEBI Circular No. SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2025/004 dated January 08, 2025 (the “Circular”) and the relevant amendments to the SEBI (Research Analysts) Regulations, 2014 (the “RA Regulations”).</Bullet>
            <Bullet prefix="(b)">In the event of any conflict or inconsistency between these T&C and any applicable SEBI regulations, circulars, or guidelines, the provisions of such SEBI regulations, circulars, or guidelines shall prevail to the extent of such conflict or inconsistency.</Bullet>

            <TitleStrip title="DEFINITIONS" />
            <Paragraph>Unless the context otherwise requires, the following definitions apply in T&C:</Paragraph>
            <Bullet><Text style={styles.boldText}>Client or User:</Text> Any person or entity that registers with the RA and agrees to these T&Cs to avail the Services.</Bullet>
            <Bullet><Text style={styles.boldText}>Services:</Text> Includes (a) research reports, data, model portfolios, or analyses pertaining to Indian-listed securities; (b) any online or offline advisory/research support; (c) any communications related thereto.</Bullet>
            <Bullet><Text style={styles.boldText}>Digital Platform:</Text> Includes websites, mobile or web applications, or other technology platforms (including third-party service providers) used for delivering the Services.</Bullet>
            <Bullet><Text style={styles.boldText}>KYC:</Text> Know Your Customer verification process mandated by SEBI (and other applicable laws) to establish the identity of Clients.</Bullet>

            <TitleStrip title="SCOPE OF SERVICES" />
            <SubHeading title="Research-Only / No Execution" />
            <Bullet>You hereby agree and acknowledge that the RA provides research and analysis only and does not execute trades on behalf of Clients, hold Clients’ funds, or provide any assured returns.</Bullet>
            <SubHeading title="No Guarantee of Returns" />
            <Bullet>You hereby agree and acknowledge that all investments carry market risk. Any past performance is not indicative of future returns, and the RA does not assure or promise any specific gain or outcome.</Bullet>
            <SubHeading title="Redistribution of Services" />
            <Bullet>You hereby agree and acknowledge that the Services are provided for your use only, and you shall not redistribute these Services under any circumstances, including for any commercial purpose.</Bullet>

            <TitleStrip title="ELIGIBILITY" />
            <SubHeading title="Legal Capacity" />
            <Bullet>Only individuals who are at least 18 years of age and otherwise competent to contract under applicable law, or legally incorporated entities, may register.</Bullet>
            <Bullet>If you are a minor or otherwise not competent to enter into a contract, you are not permitted to use or subscribe to the Services.</Bullet>
            <SubHeading title="KYC Compliance" />
            <Bullet>You hereby agree and acknowledge that you shall provide accurate, complete, and up-to-date information for the purpose of KYC.</Bullet>
            <Bullet>The RA shall verify and/or store such KYC information in accordance with applicable SEBI regulations.</Bullet>
            <Bullet>The RA reserves the right to suspend or terminate the Services at any stage if the KYC requirements under applicable regulations are not fulfilled, or if any information provided is found to be inaccurate, incomplete, false, or misleading.</Bullet>

            <TitleStrip title="REGISTRATION & ACCOUNTS" />
            <SubHeading title="Registration Process" />
            <Bullet>To access our paid Services, the Client must complete the registration form, provide all mandatory details accurately, and accept these Terms and Conditions.</Bullet>
            <Bullet>The RA reserves the right to reject or cancel registration at its discretion if any information provided by you is incorrect, incomplete, misleading, or if the Client is otherwise ineligible to avail of the Services under applicable law.</Bullet>
            <SubHeading title="Security of Credentials" />
            <Bullet>You agree and acknowledge that you shall keep your login information strictly confidential, and you shall be solely responsible and liable for any unauthorized use of your account resulting from your negligence.</Bullet>
            <Bullet>You shall notify us immediately upon becoming aware of, or suspecting, any breach of the security of your account.</Bullet>
            <SubHeading title="Use of Services" />
            <Bullet>You shall not reproduce, distribute, copy, sell, or otherwise exploit Our research content without express written consent from the RA.</Bullet>

            <TitleStrip title="FEES & PAYMENT" />
            <SubHeading title="Maximum Fee for Individual/HUF Clients" />
            <Bullet>As per Regulation 15A of the RA Regulations and the Circular, We may charge fees up to INR 1,51,000 (Rupees One Lakh Fifty-One Thousand) per annum per "family of client" (for individual and HUF clients).</Bullet>
            <Bullet>You agree that this amount excludes any statutory taxes and charges. We may revise fees in line with the Cost Inflation Index or as specified by SEBI and/or RAASB every three years.</Bullet>
            <SubHeading title="Fees for Non-Individual or Accredited Investors" />
            <Paragraph>For non-individual clients or accredited investors fees may be negotiated bilaterally without the above limit under a bilateral agreement, subject to fairness and reasonableness.</Paragraph>
            <SubHeading title="Billing & Mode of Payment" />
            <Paragraph>Fees may be charged yearly in advance or on any other mutually agreed schedule, subject to the one-year advance limit mandated by SEBI. All payments shall be made only through secure and trackable banking channels.</Paragraph>
            <SubHeading title="Refund Policy" />
            <Paragraph>In the event of premature termination of the Services, we shall refund the fees for the unexpired portion of the subscription period on a pro-rata basis, strictly in accordance with applicable SEBI regulations and circulars. No “breakage” fee or penalty shall be imposed.</Paragraph>

            <SectionHeading part="PART B" title="MANDATORY TERMS & CONDITIONS" />
            <SubHeading title="Disclosure of minimum mandatory terms and conditions to client" />
            <Paragraph>RAs shall disclose to the client the terms and conditions of the research services offered including rights and obligations. Below are the minimum mandatory T&Cs required by the Circular:</Paragraph>
            <SubHeading title="1. Availing the Services" />
            <Paragraph>By accepting delivery of the research service, the client confirms that he/she has elected to subscribe the research service of the RA at his/her sole discretion.</Paragraph>
            <SubHeading title="2. Obligations on RA" />
            <Paragraph>RA and client shall be bound by SEBI Act and all the applicable rules and regulations of SEBI.</Paragraph>
            <SubHeading title="3. Client Information & KYC" />
            <Paragraph>The client shall furnish all such details in full as may be required by the RA in its standard form. RA shall collect, store, upload and check KYC records of the clients with KRA.</Paragraph>
            <SubHeading title="4. Standard Terms of Service" />
            <Paragraph>The consent of client shall be taken on the following understanding:</Paragraph>
            <Bullet>The client has read and understood the terms and conditions applicable to a research analyst as defined under regulation 2(1)(u) of the SEBI Regulations, 2014, including the fee structure.</Bullet>
            <Bullet>The client is subscribing to the research services for our own benefits and consumption, and any reliance placed on the research report provided by research analyst shall be as per our own judgement.</Bullet>
            <Bullet prefix="i.">Any investment made based on the recommendations in the research report are subject to market risk.</Bullet>
            <Bullet prefix="ii.">Recommendations in the research report do not provide any assurance of returns.</Bullet>
            <Bullet prefix="iii.">There is no recourse to claim any losses incurred on the investments made based on the recommendations in the research report.</Bullet>
            
            <SubHeading title="Declaration of the RA that:" />
            <Bullet prefix="i.">It is duly registered with SEBI as an RA pursuant to the SEBI (Research Analysts) Regulations, 2014 (registration number INH000023728).</Bullet>
            <Bullet prefix="ii.">It has registration and qualifications required to render the services contemplated.</Bullet>
            <Bullet prefix="iii.">Research analyst services provided by it do not conflict with or violate any provision of law.</Bullet>
            <Bullet prefix="iv.">The maximum fee that may be charged by RA is ₹1.51 lakhs per annum per family of client.</Bullet>
            <Bullet prefix="v.">The recommendations provided by RA do not provide any assurance of returns.</Bullet>

            <SubHeading title="Additionally, if RA is an individual, declaration that:" />
            <Paragraph>It is not engaged in any additional professional or business activities, on a whole-time basis or in an executive capacity, which interfere with the independence of research report.</Paragraph>

            <SubHeading title="5. Consideration & Mode of Payment" />
            <Paragraph>The client shall duly pay to RA, the agreed fees for the services that RA renders to the client and statutory charges, as applicable.</Paragraph>

            <SubHeading title="6. Risk Factors" />
            <Paragraph>You acknowledge that investing in securities is subject to market risk, including but not limited to volatility and potential loss of principal, and any past performance is no indicator of future performance.</Paragraph>

            <SubHeading title="7. Conflict of Interest" />
            <Paragraph>The RA shall adhere to the applicable regulations/circulars specified by SEBI from time to time in relation to disclosure and mitigation of any actual or potential conflict of interest. RA shall disclose any conflicts of interest as mandated by SEBI and take steps to mitigate or avoid them.</Paragraph>

            <SubHeading title="8. Termination of Service & Refund of Fees" />
            <Paragraph>The RA may suspend or terminate rendering of research services to client on account of suspension/cancellation of registration of RA by SEBI and shall refund the residual amount to the client on a pro rata basis for the period from the effective date of cancellation/suspension.</Paragraph>

            <SubHeading title="9. Grievance Redressal & Dispute Resolution" />
            <Paragraph>Any grievance related to:</Paragraph>
            <Bullet prefix="(i)">non receipt of research report or</Bullet>
            <Bullet prefix="(ii)">missing pages or inability to download the entire report, or</Bullet>
            <Bullet prefix="(iii)">any other deficiency in the research services provided by RA, shall be escalated promptly by the client to the person/employee designated by RA (Namita Rathore Proprietor of Bharat Stock Market Research, namitarathore05071992@gmail.com).</Bullet>
            <Paragraph>The RA shall be responsible to resolve grievances within 7 (seven) business working days. If unresolved, the client may escalate the complaint to SEBI via the SCORES portal or undertake Online Dispute Resolution (ODR).</Paragraph>

            <SubHeading title="10. Additional Clauses" />
            <Paragraph>Any additional voluntary clauses in this agreement shall not conflict with SEBI regulations/circulars. Any changes to such voluntary clauses shall be preceded by 15 days’ notice.</Paragraph>
            
            <SubHeading title="11. Mandatory Notice" />
            <Paragraph>The Client is requested to go through Do’s and Don’ts while dealing with RA as specified in SEBI master circular no. SEBI/HO/MIRSD-POD 1/P/CIR/2024/49 dated May 21, 2024.</Paragraph>

            <SubHeading title="12. Most Important Terms & Conditions (MITC)" />
            <Paragraph>The terms and conditions and the consent thereon are for the research services provided by the RA and RA cannot execute/carry out any trade (purchase/sell transaction) on behalf of the client. Thus, you are advised not to permit RA to execute any trade on your behalf.</Paragraph>

            <SubHeading title="13. Optional Centralised Fee Collection Mechanism" />
            <Paragraph>RA Shall provide the guidance to their clients on an optional ‘Centralised Fee Collection Mechanism for IA and RA’ (CeFCoM) available to them for payment of fees to RA.</Paragraph>

            <SectionHeading part="PART C" title="MOST IMPORTANT TERMS AND CONDITIONS (MITC)" />
            <Bullet prefix="1.">These terms and conditions, and consent thereon are for the research services provided by the Research Analyst (RA) and RA cannot execute/carry out any trade on behalf of the client.</Bullet>
            <Bullet prefix="2.">The fee charged by RA to the client will be subject to the maximum of amount prescribed by SEBI. (Note: The current fee limit is Rs 1,51,000/- per annum per family of client. The fee limit does not include statutory charges. The fee limits do not apply to a non-individual client / accredited investor).</Bullet>
            <Bullet prefix="3.">RA may charge fees in advance if agreed by the client. Such advance shall not exceed the period stipulated by SEBI; presently, it is one year. In case of premature termination of the RA services by either the client or the RA, the client shall be entitled to seek a refund of proportionate fees only for the unexpired period.</Bullet>
            <Bullet prefix="4.">Fees to RA may be paid by the client through any of the specified modes like cheque, online bank transfer, UPI, etc. Cash payment is not allowed.</Bullet>
            <Bullet prefix="5.">The RA is required to abide by the applicable regulations specified by SEBI and RAASB in relation to disclosure and mitigation of any actual or potential conflict of interest.</Bullet>
            <Bullet prefix="6.">Any assured/guaranteed/fixed returns schemes or any other schemes of similar nature are prohibited by law. No scheme of this nature shall be offered to the client by the RA.</Bullet>
            <Bullet prefix="7.">The RA cannot guarantee returns, profits, accuracy, or risk-free investments from the use of the RA’s research services.</Bullet>
            <Bullet prefix="8.">Any investment made based on recommendations in research reports are subject to market risks, and recommendations do not provide any assurance of returns.</Bullet>
            <Bullet prefix="9.">The SEBI registration, Enlistment with RAASB, and NISM certification do not guarantee the performance of the RA or assure any returns to the client.</Bullet>
            <Bullet prefix="10.">
              <Text style={styles.boldText}>For any grievances:</Text>{"\n\n"}
              <Text style={styles.boldText}>Step 1:</Text> The client should first contact the RA using the details on its website.{"\n"}
              <Text style={styles.boldText}>Customer Care:</Text> +91 9457296893{"\n"}
              <Text style={styles.boldText}>Contact Person:</Text> Namita Rathore{"\n"}
              <Text style={styles.boldText}>Email-ID:</Text> namitarathore05071992@gmail.com{"\n\n"}
              <Text style={styles.boldText}>Step 2:</Text> If the resolution is unsatisfactory, the client can lodge grievances through SEBI’s SCORES platform at www.scores.sebi.gov.in.{"\n\n"}
              <Text style={styles.boldText}>Step 3:</Text> The client may also consider the Online Dispute Resolution (ODR) through the Smart ODR portal at https://smartodr.in.
            </Bullet>
            <Bullet prefix="11.">Clients are required to keep contact details updated with the RA at all times.</Bullet>
            <Bullet prefix="12.">The RA shall never ask for the client’s login credentials and OTPs for the client’s Trading Account Demat Account and Bank Account.</Bullet>

            <SectionHeading part="PART D" title="REPRESENTATIONS, WARRANTIES & LIABILITY" />
            <TitleStrip title="RA’s Declarations" />
            <Bullet>The RA declares that it is duly registered under the SEBI (Research Analysts) Regulations, 2014.</Bullet>
            <Bullet>The RA meets or exceeds the qualification and certification requirements mandated by SEBI or NISM.</Bullet>
            <Bullet>The RA’s services do not conflict with or violate any law or regulation to which it is subject.</Bullet>

            <TitleStrip title="Client’s Declarations" />
            <Bullet>You represent that You are legally entitled to enter this Agreement and that Your KYC details are true and correct.</Bullet>
            <Bullet>You understand the nature of market risks and volatility inherent in securities investments.</Bullet>

            <TitleStrip title="CONFIDENTIALITY & DATA PROTECTION" />
            <Bullet>We respect Your privacy and will not share or disclose Your personal data except as required by law or to fulfil regulatory obligations.</Bullet>
            <Bullet>While We endeavour to protect data transmissions, We cannot guarantee the complete security of data over the internet.</Bullet>

            <TitleStrip title="LIMITATION OF LIABILITY & INDEMNIFICATION" />
            <Paragraph><Text style={styles.boldText}>No Assured Returns:</Text> We shall not be liable for any direct, indirect, incidental, or consequential losses, including lost profits, due to Your reliance on Our research reports.</Paragraph>
            <Paragraph><Text style={styles.boldText}>Force Majeure:</Text> Neither party shall be liable for any failure or delay in performing any of its obligations under this Agreement if such failure or delay is caused by events beyond the reasonable control of that party.</Paragraph>
            <Paragraph><Text style={styles.boldText}>Indemnification:</Text> You agree to indemnify and hold harmless the RA from any claims, damages, losses, or liabilities arising out of Your breach of these T&Cs, unauthorized use of Your account, or third-party claims related to Your actions.</Paragraph>

            <TitleStrip title="SUSPENSION, TERMINATION & MISCELLANEOUS" />
            <Paragraph>We reserve the right to suspend Your account or access to Services with or without notice if You breach these T&Cs or if required by SEBI/regulators.</Paragraph>
            <Paragraph>These T&Cs shall be governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts/tribunals in <Text style={styles.boldText}>Uttar Pradesh</Text>.</Paragraph>

            <SectionHeading part="PART E" title="DISCLAIMER" />
            <Bullet prefix="1.">Investments in securities market are subject to market risks. Read all the related documents carefully before investing.</Bullet>
            <Bullet prefix="2.">Registration granted by SEBI and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.</Bullet>
            <Bullet prefix="3.">The fee is paid for research recommendations and is not refundable or cancellable under any circumstances.</Bullet>
            <Bullet prefix="4.">We do not provide any guaranteed profit or fixed returns or any other services.</Bullet>
            <Bullet prefix="5.">Images if shared are for illustration purposes only.</Bullet>
            <Bullet prefix="6.">We are not responsible for any financial loss or any other loss incurred by the client.</Bullet>
            <Bullet prefix="7.">Please be fully informed about the risk and costs involved in trading and investing. Consult a qualified financial advisor to understand suitability.</Bullet>
            <Bullet prefix="8.">Trading in options is risky due to its volatile nature. Upon accepting our service, you hereby accept that you fully understand the risks involved in trading.</Bullet>
            <Bullet prefix="9.">We advise the viewers to apply their own discretion while referring to testimonials shared by the client. Past performances and results are no guarantee of future performance.</Bullet>
            <Bullet prefix="10.">All recommendations shared are confidential and for the reference of paid members only.</Bullet>
            <Bullet prefix="11.">The recommendations must not be used as a singular basis of any investment decision.</Bullet>

            <SectionHeading part="PART F" title="CLIENT CONSENT & ACKNOWLEDGMENT" />
            <Paragraph>The Client hereby provides consent, confirming that they have thoroughly reviewed and comprehended the terms and conditions of the research analysis services and this entire agreement presented by the Research Analyst. This includes a clear understanding of the fee structure, as well as the mechanism for fee charging and payment. Furthermore, the Client acknowledges that, upon their written request to the Research Analyst, they were afforded the opportunity to pose questions and engage with individuals associated with the research analysis.</Paragraph>
            <Paragraph>By signing this document, the Client acknowledges that the Research Analyst provides research and analysis only and does not execute trades, hold funds, or guarantee returns.</Paragraph>

            {/* CUSTOMER DETAILS TABLE */}
            <TitleStrip title="CUSTOMER DETAILS*" />
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Name</Text>
                <Text style={styles.tableValue}>{userName}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>E-Mail</Text>
                <Text style={styles.tableValue}>{userEmail}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Phone Number</Text>
                <Text style={styles.tableValue}>{userPhone}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Amount Paid (INR)</Text>
                <Text style={[styles.tableValue, styles.textHighlight]}>₹ {amount.toFixed(2)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Date of Agreement</Text>
                <Text style={styles.tableValue}>{currentDate}</Text>
              </View>
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.tableLabel}>Period of Service</Text>
                <Text style={[styles.tableValue, { textTransform: 'uppercase' }]}>{planName} - {durationName}</Text>
              </View>
            </View>
            <Text style={styles.asteriskText}>*Not Required in case of Digitally Signed</Text>

            {/* DIGITAL SIGNATURE SECTION */}
            <View style={styles.signatureBox}>
              <View style={styles.signatureDetails}>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                  <Text style={styles.successBadgeText}>DIGITAL CONSENT RECORDED</Text>
                </View>
                <Text style={styles.signatureSmallText}>I declare that I have read, understood and accepted all terms.</Text>
                <Text style={styles.signatureSmallText}><Text style={styles.boldText}>Signed By:</Text> {userName}</Text>
                <Text style={styles.signatureSmallText}><Text style={styles.boldText}>Aadhaar:</Text> {aadhaarNumber}</Text>
                <Text style={styles.signatureSmallText}><Text style={styles.boldText}>Timestamp:</Text> {currentTime}</Text>
                <View style={styles.signatureVisual}>
                {signatureUrl ? (
                  <View style={styles.imageWrapper}>
                    <Image 
                      key={signatureUrl}
                      // Use the dynamic variable, or if you want to hardcode for a test, 
                      // make sure it is exactly "https://..." without the 'r'
                      source={{ uri: signatureUrl }} 
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.noSignatureBox}>
                    <Text style={styles.digitalSignLabel}>Digitally Signed via Secure Auth</Text>
                  </View>
                )}
                <View style={styles.signatureLine} />
                <Text style={styles.authorizedText}>Digital Authorized Signatory</Text>
              </View>
              </View>

              <View style={styles.signatureVisual}>
                {signatureUrl ? (
                  <View style={styles.imageWrapper}>
                    <Image 
                      key={signatureUrl}
                      source={{ 
                        uri: "rhttps://bharatstockmarketresearch.com/storage/248/selfie_FIL260326103220804QEOUP2NLEQ5LBU.jpg",
                        headers: {
                          Accept: 'image/*',
                        },
                        cache: 'reload'
                      }} 
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.noSignatureBox}>
                    <Text style={styles.digitalSignLabel}>Digitally Signed via Secure Auth</Text>
                  </View>
                )}
                <View style={styles.signatureLine} />
                <Text style={styles.authorizedText}>Digital Authorized Signatory</Text>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* BOTTOM ACTION BAR */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.checkboxContainer, isChecked && styles.checkboxContainerActive]} 
            activeOpacity={0.8} 
            onPress={() => setIsChecked(!isChecked)}
            disabled={isSigning}
          >
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              I confirm that I have read all 9 pages and I accept the terms of the Research Analyst Agreement.
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSigning}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.signBtn, (!isChecked || isSigning) && styles.signBtnDisabled]} 
              onPress={onSignAndProceed}
              disabled={!isChecked || isSigning}
            >
              {isSigning ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signBtnText}>SIGN & PROCEED</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#082f49', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { backgroundColor: '#0369a1', padding: 8, borderRadius: 8, marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  headerSub: { color: '#7dd3fc', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  closeBtn: { padding: 4 },
  scrollView: { flex: 1, padding: 16 },
  scrollContent: { paddingBottom: 40 },
  documentPaper: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  docTracking: { alignItems: 'flex-end', marginBottom: 20 },
  trackingText: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  sectionCenter: { alignItems: 'center', marginTop: 30, marginBottom: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 30 },
  partHeading: { fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline', textAlign: 'center', marginBottom: 4 },
  mainHeading: { fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline', textAlign: 'center' },
  titleStrip: { fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline', textTransform: 'uppercase', marginTop: 24, marginBottom: 12, color: '#0f172a' },
  subHeading: { fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline', marginTop: 16, marginBottom: 6, color: '#1e293b' },
  paragraph: { fontSize: 13, color: '#334155', lineHeight: 22, marginBottom: 12, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  boldText: { fontWeight: 'bold', color: '#0f172a' },
  textHighlight: { color: '#0369a1', fontWeight: 'bold' },
  bulletRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
  bulletPrefix: { marginRight: 8, fontSize: 13, fontWeight: 'bold', color: '#0f172a', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginTop: 1 },
  table: { borderWidth: 1, borderColor: '#334155', borderRadius: 4, overflow: 'hidden', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#334155' },
  tableLabel: { flex: 1.2, padding: 12, backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: 12, borderRightWidth: 1, borderRightColor: '#334155', color: '#0f172a' },
  tableValue: { flex: 2, padding: 12, fontSize: 12, color: '#334155' },
  asteriskText: { fontSize: 10, color: '#64748b', fontStyle: 'italic', marginTop: 6 },
  signatureBox: { marginTop: 40, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  signatureDetails: { flex: 1, minWidth: 200 },
  successBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  successBadgeText: { color: '#15803d', fontSize: 10, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.5 },
  signatureSmallText: { fontSize: 11, color: '#475569', marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  signatureVisual: { alignItems: 'center', justifyContent: 'flex-end', minWidth: 150 },
  digitalSignLabel: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginBottom: 16 },
  imageWrapper: { 
    width: 160, 
    height: 80, 
    marginBottom: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff' // Helps visibility
  },
  signatureImage: { 
    width: 160, // Fixed width
    height: 80,  // Fixed height
  },
  noSignatureBox: { height: 60, justifyContent: 'center', alignItems: 'center' },
  signatureLine: { width: 180, height: 1, backgroundColor: '#334155', marginBottom: 6 },
  authorizedText: { fontSize: 9, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', marginBottom: 16 },
  checkboxContainerActive: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#94a3b8', borderRadius: 6, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#082f49', borderColor: '#082f49' },
  checkboxText: { flex: 1, fontSize: 12, fontWeight: 'bold', color: '#082f49', lineHeight: 18 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 24, marginRight: 8 },
  cancelBtnText: { color: '#64748b', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  signBtn: { backgroundColor: '#082f49', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, shadowColor: '#082f49', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4, minWidth: 160, alignItems: 'center' },
  signBtnDisabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
  signBtnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
});

export default AgreementDocumentModal;