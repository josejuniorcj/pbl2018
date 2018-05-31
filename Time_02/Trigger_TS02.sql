DELIMITER $$
CREATE TRIGGER stagihobd.DepoisDelete_TBLHospitais BEFORE DELETE ON stagihobd.TBL_HOSPITAL
FOR EACH ROW BEGIN
DELETE FROM stagihobd.TBL_LEITO WHERE HOS_Id = OLD.HOS_Id; 
END
