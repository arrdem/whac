package com.schlaf.steam.activities.battle;

import java.io.Serializable;

import com.schlaf.steam.data.SingleModel;

public class MiniModelDescription implements Serializable {

	/** serial  */
	private static final long serialVersionUID = 4563580883489090697L;
	
	private String name;
	private int def;
	private int arm;
	
	public MiniModelDescription(SingleModel model) {
		def = model.getDEF();
		arm = model.getARM();
		name = model.getName();
	}

	public int getDef() {
		return def;
	}

	public int getArm() {
		return arm;
	}
	
	public String getName() {
		return name;
	}
	
	public String getDefArmLabel() {
		StringBuffer sb = new StringBuffer(20);
		sb.append("DEF ").append(def).append(" - ARM ").append(arm);
		return sb.toString();
	}

	public void setName(String name) {
		this.name = name;
	}

}
