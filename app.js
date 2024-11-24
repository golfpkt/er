var express = require('express')
var cors = require('cors')
const { Pool } = require("pg");
var bodyParser = require('body-parser')


var app = express()

const PORT = process.env.PORT || 3333

require("dotenv").config(); // To load the .env file variables

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
module.exports = pool;

const basicAuth = require('express-basic-auth');


    const auth = basicAuth({
      users: { 'thalang': '@11356' },
      challenge: true,
      realm: 'Imb4T3st4pp'
  });

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.json({ info: 'Hello Golf Welcome to My API' ,  status: "success" })
})



app.post('/person', auth, async (req, res) => {
const { startDate, endDate } = req.body;  
try {
  const query = `WITH date_range AS (
  SELECT
    $1::date AS start_date,
    CASE
      WHEN $2::date - $1::date > 365 THEN $1::date + INTERVAL '365 days'
      ELSE $2::date
    END AS end_date
)
SELECT person.person_id,
  person.cid,
  person.house_id,
  pname.provis_code,
  person.pname,
  person.fname,
  person.lname,
  person.sex,
  person.birthdate,
  person.patient_hn,
  patient.passport_no,
  person.marrystatus,
  person.nationality,
  person.religion,
  person.education,
  person.occupation,
  person.hometel,
  person.mobile_phone,
  person.blood_group,
  person.bloodgroup_rh,
  person.person_discharge_id,
  person.discharge_date,
  person.house_regist_type_id,
  person.movein_date
FROM patient
  INNER JOIN person ON person.patient_hn = patient.hn AND person.cid = patient.cid
  LEFT JOIN pname ON pname.name = person.pname
WHERE patient.hn IN (
  SELECT DISTINCT ovst.hn 
  FROM ovst 
  INNER JOIN er_nursing_detail ON er_nursing_detail.vn = ovst.vn
  CROSS JOIN date_range
  WHERE ovst.vstdate BETWEEN date_range.start_date AND date_range.end_date
    AND er_nursing_detail.er_accident_type_id IN ('1', '17', '19')
)`;
const result = await pool.query(query, [startDate, endDate]);
    
  
if (result.rows.length > 0) {
  res.json({ success: true, data: result.rows });
} else {
  res.json({ success: false, message: 'No data found for the given date range' });
}
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: 'Server error' });
}
});



app.post('/service', auth, async (req, res) => {
  const { startDate, endDate } = req.body;  
  try {
    const query = `WITH date_range AS (
    SELECT
      $1::date AS start_date,
      CASE
        WHEN $2::date - $1::date > 31 THEN $1::date + INTERVAL '31 days'
        ELSE $2::date
      END AS end_date
  )
SELECT ovst.vn,
  ovst_seq.pcu_person_id,
  ovst.hn,
  ovst_seq.seq_id,
  ovst.vstdate,
  ovst.vsttime,
  person.in_region,
  ovst.visit_type,
  ovst.spclty AS clinic_code,
  spclty.name AS clinic_name,
  ovstist.export_code AS typein,
  ovst.pttype,
  pttype.hipdata_code AS instype_ec,
  ovst.hospmain,
  ovst.hospsub,
  referin.hospcode AS refin_hosp,
  referin.referin_number,
  referin.refer_date,
  referin.rfrcs,
  opdscreen.cc,
  opdscreen.bw,
  opdscreen.height,
  opdscreen.bmi,
  opdscreen.temperature,
  opdscreen.bps,
  opdscreen.bpd,
  opdscreen.pulse,
  opdscreen.rr,
  ovstost.export_code AS typeout,
  referout.hospcode AS refout_hosp,
  rfrcs.export_code AS refout_cause,
  vn_stat.income,
  vn_stat.paid_money,
  vn_stat.rcpt_money,
  patient.cid
FROM ovst
  INNER JOIN ovst_seq ON ovst_seq.vn = ovst.vn
  INNER JOIN patient ON patient.hn = ovst.hn
  INNER JOIN person ON person.cid = patient.cid AND person.patient_hn = patient.hn
  LEFT JOIN spclty ON spclty.spclty = ovst.spclty
  LEFT JOIN ovstist ON ovstist.ovstist = ovst.ovstist
  LEFT JOIN pttype ON pttype.pttype = ovst.pttype
  LEFT JOIN referin ON referin.vn = ovst.vn
  LEFT JOIN opdscreen ON opdscreen.vn = ovst.vn
  LEFT JOIN ovstost ON ovstost.ovstost = ovst.ovstost
  LEFT JOIN referout ON referout.vn = ovst.vn
  LEFT JOIN rfrcs ON rfrcs.rfrcs = referout.rfrcs
  INNER JOIN vn_stat ON vn_stat.vn = ovst.vn
WHERE ovst.vn IN (SELECT ovst.vn FROM ovst INNER JOIN er_nursing_detail ON er_nursing_detail.vn = ovst.vn
  CROSS JOIN date_range
  WHERE ovst.vstdate  BETWEEN date_range.start_date AND date_range.end_date AND er_nursing_detail.er_accident_type_id IN ('1', '17', '19') ORDER BY ovst.vstdate)

`;
  const result = await pool.query(query, [startDate, endDate]);
      
    
  if (result.rows.length > 0) {
    res.json({ success: true, data: result.rows });
  } else {
    res.json({ success: false, message: 'No data found for the given date range' });
  }
  } catch (err) {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
  }
  });
  
app.post('/accident', auth, async (req, res) => {
  const { startDate, endDate } = req.body;  
  try {
    const query = `WITH date_range AS (
    SELECT
      $1::date AS start_date,
      CASE
        WHEN $2::date - $1::date > 365 THEN $1::date + INTERVAL '365 days'
        ELSE $2::date
      END AS end_date
  )
SELECT ovst_seq.pcu_person_id,
  ovst_seq.seq_id,
  ovst.vstdate,
  ovst.vsttime,
  er_nursing_detail.accident_datetime,
  er_nursing_detail.er_accident_type_id,
  er_nursing_detail.accident_alcohol_type_id,
  er_nursing_detail.accident_drug_type_id,
  er_nursing_detail.accident_belt_type_id,
  er_nursing_detail.accident_helmet_type_id,
  er_nursing_detail.accident_airway_type_id,
  er_nursing_detail.accident_bleed_type_id,
  er_nursing_detail.accident_splint_type_id,
  er_nursing_detail.accident_fluid_type_id,
  er_nursing_detail.gcs_e,
  er_nursing_detail.gcs_v,
  er_nursing_detail.gcs_m,
  patient.cid,
  accident_place_type.export_code,
  accident_place_type.accident_place_type_name,
  er_nursing_visit_type.export_code AS export_code1,
  er_nursing_visit_type.visit_name,
  accident_person_type.export_code AS export_code2,
  accident_person_type.accident_person_type_name,
  accident_transport_type.export_code AS export_code3,
  accident_transport_type.accident_transport_type_name
FROM er_nursing_detail
  INNER JOIN ovst_seq ON ovst_seq.vn = er_nursing_detail.vn
  INNER JOIN ovst ON ovst.vn = er_nursing_detail.vn
  INNER JOIN patient ON patient.hn = ovst.hn
  LEFT JOIN accident_place_type ON accident_place_type.accident_place_type_id = er_nursing_detail.accident_place_type_id
  LEFT JOIN er_nursing_visit_type ON er_nursing_visit_type.visit_type = er_nursing_detail.visit_type
  LEFT JOIN accident_person_type ON accident_person_type.accident_person_type_id = er_nursing_detail.accident_person_type_id
  LEFT JOIN accident_transport_type ON accident_transport_type.accident_transport_type_id = er_nursing_detail.accident_transport_type_id
WHERE er_nursing_detail.vn IN (SELECT ovst.vn FROM ovst INNER JOIN er_nursing_detail ON er_nursing_detail.vn = ovst.vn
  CROSS JOIN date_range
  WHERE ovst.vstdate  BETWEEN date_range.start_date AND date_range.end_date AND er_nursing_detail.er_accident_type_id IN ('1', '17', '19') ORDER BY ovst.vstdate)

`;
  const result = await pool.query(query, [startDate, endDate]);
      
    
  if (result.rows.length > 0) {
    res.json({ success: true, data: result.rows });
  } else {
    res.json({ success: false, message: 'No data found for the given date range' });
  }
  } catch (err) {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
  }
  });
  
app.post('/death', auth, async (req, res) => {
  const { startDate, endDate } = req.body;  
  try {
    const query = `WITH date_range AS (
    SELECT
      $1::date AS start_date,
      CASE
        WHEN $2::date - $1::date > 365 THEN $1::date + INTERVAL '365 days'
        ELSE $2::date
      END AS end_date
  )
SELECT death.hn,
  patient.cid,
  person.person_id,
  death.death_hospcode,
  ovst_seq.seq_id,
  ovst.vn,
  death.an,
  death.death_date,
  death.death_diag_1,
  death.death_diag_2,
  death.death_diag_3,
  death.death_diag_4,
  death.death_diag_other,
  death.death_cause_text,
  death.death_diag_icd10,
  death.nopreg,
  death.wpreg,
  death.death_cause,
  death.death_place,
  death.death_source,
  person_death.death_number
FROM death
  INNER JOIN patient ON patient.hn = death.hn
  INNER JOIN person ON person.cid = patient.cid AND person.patient_hn = patient.hn
  INNER JOIN person_death ON person_death.person_id = person.person_id
  LEFT JOIN ovst ON ovst.hn = death.hn AND ovst.vstdate = death.death_date
  LEFT JOIN ovst_seq ON ovst_seq.vn = ovst.vn
WHERE death.hn IN (SELECT DISTINCT ovst.hn FROM ovst INNER JOIN er_nursing_detail ON er_nursing_detail.vn = ovst.vn
  CROSS JOIN date_range
  WHERE ovst.vstdate  BETWEEN date_range.start_date AND date_range.end_date AND er_nursing_detail.er_accident_type_id IN ('1', '17', '19'))

`;
  const result = await pool.query(query, [startDate, endDate]);
      
  if (result.rows.length > 0) {
    res.json({ success: true, data: result.rows });
  } else {
    res.json({ success: false, message: 'No data found for the given date range' });
  }
  } catch (err) {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
  }
  });
  
app.post('/admission', auth, async (req, res) => {
  const { startDate, endDate } = req.body;  
  try {
    const query = `WITH date_range AS (
    SELECT
      $1::date AS start_date,
      CASE
        WHEN $2::date - $1::date > 365 THEN $1::date + INTERVAL '365 days'
        ELSE $2::date
      END AS end_date
  )
SELECT ipt.vn,
  ipt.hn,
  ovst_seq.pcu_person_id,
  ovst_seq.seq_id,
  ipt.an,
  ipt.regdate,
  ipt.regtime,
  ipt.dchstts,
  ipt.dchtype,
  ipt.dchdate,
  ipt.dchtime,
  ipt.drg,
  ipt.rw,
  ipt.adjrw,
  ipt.wtlos,
  ipt.pttype,
  ipt.spclty,
  ipt.ipt_type,
  ipt.iref_type,
  ipt.gravidity,
  ipt.parity,
  ipt.living_children,
  ipt.bw,
  ipt.body_height,
  ipt.refer_out_number,
  ipt.ipt_cause_type_id,
  ipt.ipt_severe_type_id,
  ipt.ipt_cause_type_note,
  ipt.dch_severe_type_id,
  ipt.ipt_summary_status_id,
  an_stat.pdx,
  an_stat.dx0,
  an_stat.dx1,
  an_stat.dx2,
  an_stat.dx3,
  an_stat.dx4,
  an_stat.dx5,
  an_stat.sex,
  an_stat.age_y,
  an_stat.age_m,
  an_stat.age_d,
  an_stat.aid,
  an_stat.income,
  an_stat.paid_money,
  an_stat.remain_money,
  an_stat.rcpt_money,
  an_stat.debt_money
FROM ipt
  INNER JOIN ovst_seq ON ovst_seq.vn = ipt.vn
  INNER JOIN an_stat ON an_stat.an = ipt.an
WHERE ipt.vn IN (SELECT ovst.vn FROM ovst INNER JOIN er_nursing_detail ON er_nursing_detail.vn = ovst.vn
  CROSS JOIN date_range
  WHERE ovst.vstdate  BETWEEN date_range.start_date AND date_range.end_date AND er_nursing_detail.er_accident_type_id IN ('1', '17', '19') ORDER BY ovst.vstdate)

`;
  const result = await pool.query(query, [startDate, endDate]);
      
    
  if (result.rows.length > 0) {
    res.json({ success: true, data: result.rows });
  } else {
    res.json({ success: false, message: 'No data found for the given date range' });
  }
  } catch (err) {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
  }
  });


  app.post('/referout', auth, async (req, res) => {
    const { startDate, endDate } = req.body;  
    try {
      const query = `WITH date_range AS (
      SELECT
        $1::date AS start_date,
        CASE
          WHEN $2::date - $1::date > 365 THEN $1::date + INTERVAL '365 days'
          ELSE $2::date
        END AS end_date
    )
SELECT referout.vn,
  ovst_seq.seq_id,
  ovst_seq.pcu_person_id,
  referout.referout_id,
  ovst.an,
  referout.refer_point,
  spclty.spclty,
  spclty.name AS spclty_name,
  referout.refer_hospcode,
  hospcode.name AS hosname,
  ovst.vstdate,
  ovst.vsttime,
  referout.refer_date,
  referout.refer_time,
  ipt.regdate,
  ipt.regtime,
  referout_emergency_type.export_code AS emer_type_code,
  referout_emergency_type.referout_emergency_type_name,
  referout_sp_type.export_code AS sp_type_code,
  referout_sp_type.referout_sp_type_name,
  opdscreen.cc,
  referout.pre_diagnosis,
  referout.pdx
FROM referout
  INNER JOIN ovst_seq ON ovst_seq.vn = referout.vn
  INNER JOIN ovst ON ovst.vn = referout.vn
  LEFT JOIN kskdepartment ON kskdepartment.depcode = referout.depcode
  INNER JOIN spclty ON spclty.spclty = kskdepartment.spclty
  LEFT JOIN hospcode ON hospcode.hospcode = referout.refer_hospcode
  LEFT JOIN ipt ON ipt.an = ovst.an
  LEFT JOIN referout_emergency_type ON referout_emergency_type.referout_emergency_type_id = referout.referout_emergency_type_id
  LEFT JOIN referout_sp_type ON referout_sp_type.referout_sp_type_id = referout.referout_sp_type_id
  LEFT JOIN opdscreen ON opdscreen.vn = ovst.vn
WHERE referout.vn IN (SELECT ovst.vn FROM ovst INNER JOIN er_nursing_detail ON er_nursing_detail.vn = ovst.vn

    CROSS JOIN date_range
    WHERE ovst.vstdate  BETWEEN date_range.start_date AND date_range.end_date AND er_nursing_detail.er_accident_type_id IN ('1', '17', '19') ORDER BY ovst.vstdate)
  
  `;
    const result = await pool.query(query, [startDate, endDate]);
        
      
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows });
    } else {
      res.json({ success: false, message: 'No data found for the given date range' });
    }
    } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
    }
    });
  


app.listen(PORT, ()=>{
	console.log(`SERVER ON PORT ${PORT}`)
})