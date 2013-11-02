package com.schlaf.steam.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * column damage for warmachine grid (from top to bottom
 * @author S0085289
 *
 */
public class DamageColumn implements Serializable {
	/** serial */
	private static final long serialVersionUID = 7108244888127130419L;
	int id;
	List<DamageBox> boxes = new ArrayList<DamageBox>();
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public List<DamageBox> getBoxes() {
		return boxes;
	}
	public void setBoxes(List<DamageBox> boxes) {
		this.boxes = boxes;
	}
	
	/**
	 * applies damages, return count of damages applied on this column
	 * @param dmg
	 * @return
	 */
	public int applyDamages(int dmg) {
		int dmgApplied = 0;
		for (DamageBox box : boxes) {
			if (dmgApplied < dmg) {
				if (!box.getSystem().equals(
						WarmachineDamageSystemsEnum.EMPTY)) {
					if (!box.isDamaged()) {
						box.setDamaged(true);
						dmgApplied++;
					}

				}
			}
		}
		return dmgApplied;
	}

	/**
	 * applies damages, return count of damages applied on this column
	 * @param dmg
	 * @return
	 */
	public int applyFakeDamages(int dmg) {
		int dmgApplied = 0;
		if (dmg > 0) {
			for (DamageBox box : boxes) {
				if (dmgApplied < dmg) {
					if (!box.getSystem().equals(
							WarmachineDamageSystemsEnum.EMPTY)) {
						if (!box.isDamaged() && !box.isDamagedPending()) {
							box.setDamagedPending(true);
							box.setCurrentlyChangePending(true);
							dmgApplied++;
						}

					}
				}
			}
		} else {
			// remove
			for (int i = boxes.size() - 1; i >= 0; i--) {
				DamageBox box = boxes.get(i);
				if (dmgApplied < - dmgApplied) {
					if (box.isDamaged() && ! box.isCurrentlyChangePending()) {
						box.setCurrentlyChangePending(true);
						box.setDamagedPending(false);
						dmgApplied ++;
					}
					if (box.isDamagedPending() && box.isCurrentlyChangePending()) {
						box.setCurrentlyChangePending(false);
						box.setDamagedPending(false);
						dmgApplied ++;
					}
				}
			}
		}
		return dmgApplied;
	}
}
